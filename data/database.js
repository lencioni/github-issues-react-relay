const fetch = require('node-fetch');

import {
  cursorForObjectInConnection,
} from 'graphql-relay';

const CLIENT_ID = '1ab301e6cff0b8da5de7';
const CLIENT_SECRET = '74c0729c6b68ad2b0f92d439b51197f511ce6731';

// Model types
export class Issue extends Object {
  constructor(data) {
    super(data);

    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  }
}
export class Comment extends Object {}
export class Label extends Object {}
export class Repo extends Object {}
export class User extends Object {}

const repo = new Repo();
repo.id = 'npm/npm';
repo.itemsPerPage = undefined;
repo.lastPage = undefined;

let issues = [];

/**
 * @param {String} idAndNumber encoded GitHub issue ID and number pair
 * @return {String} GitHub issue number
 */
function extractNumberFromIdAndNumber(idAndNumber) {
  return idAndNumber.match(/;(\d+)$/)[1];
}

/**
 * @param {Number} number GitHub issue number
 * @return {Promise} Resolves to an object that contains the issue data
 */
function fetchIssue(number) {
  return fetch(`https://api.github.com/repos/npm/npm/issues/${number}` +
               `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`)
    .then(result => result.json());
}

/**
 * @param {String} url URL to fetch paginated items from
 * @param {Object} parent Object that owns the items that we are fetching
 * @param {Number} page Page number that we will be asking GitHub for
 * @param {Number} itemsCount Number of items that we already have
 * @param {Number} count Number of items that we want to fetch
 * @return {Promise} Resolves to an array of objects that contain the data we
 *   fetched.
 */
function fetchPaginatedItems(url, parent, page, itemsCount, count) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .catch(err => reject(err))
      .then(result => {
        if (parent.lastPage === undefined) {
          // Find out what the last page is. GitHub encodes this information
          // into a link header.
          const linkHeader = result.headers.get('link');
          if (linkHeader) {
            const links = linkHeader.split(',');
            const lastPageLink = links.find(link => link.includes('rel="last"'));
            if (lastPageLink) {
              parent.lastPage = parseInt(lastPageLink.match(/page=(\d+)/)[1], 10);
            } else {
              parent.lastPage = page;
            }
          } else {
            parent.lastPage = page;
          }
        }

        // Convert the result into JSON, because that is the only thing we need
        // from here on out.
        return result.json();
      })
      .then(json => {
        if (parent.itemsPerPage === undefined) {
          parent.itemsPerPage = json.length;
        }

        if (page < parent.lastPage && itemsCount + json.length < count) {
          fetchIssues(page + 1, itemsCount + json.length, count)
            .catch(err => reject(err))
            .then(nextPage => {
              json.push(...nextPage)
              return json;
            })
            .then(json => resolve(json));
        } else {
          resolve(json);
        }
      })
  });
}

/**
 * @param {Repo} repo Repo that these issues belong to
 * @param {Number} page Page number that we will be asking GitHub for
 * @param {Number} issuesCount Number of issues that we already have
 * @param {Number} count Number of issues that we want to have
 * @return {Issue[]}
 */
function fetchIssues(repo, page, issuesCount, count) {
  const url = `https://api.github.com/repos/npm/npm/issues?page=${page}` +
              `&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  return fetchPaginatedItems(url, repo, page, issuesCount, count);
}

/**
 * @param {Issue} issue Issue that these comments belong to
 * @param {Number} page Page number that we will be asking GitHub for
 * @param {Number} commentsCount Number of comments that we already have
 * @param {Number} count Number of comments that we want to have
 * @return {Comment[]}
 */
function fetchComments(issue, page, commentsCount, count) {
  const url = `https://api.github.com/repos/npm/npm/issues/${issue.number}/comments` +
              `?page=${page}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  return fetchPaginatedItems(url, issue, page, commentsCount, count);
}

/**
 * @param {Object} parent The object that owns the paginated items
 * @param {Object[]} cachedItems Array of the items that we've already fetched
 * @param {Function} fetchFn Function that will fetch the paginated items
 * @param {String} after Relay cursor
 * @param {Number} first Number of items to get
 * @return {Object[]}
 */
async function getPaginatedItems(parent, cachedItems, fetchFn, after, first) {
  let count;
  if (!after) {
    count = first;
  } else {
    // Iterate backwards over the items we have looking at their cursors to
    // find what after is pointing to. We are iterating backwards because the
    // cursor is likely to be very close to the end because our issues array
    // contains what we have from GitHub so far.
    for (let i = cachedItems.length - 1; i >= 0; i--) {
      const item = cachedItems[i];
      const cursor = cursorForObjectInConnection(cachedItems, item);
      if (cursor === after) {
        count = i + 1 + first;
      }
    }
  }

  // Always fetch at least 1 extra, so that Relay always knows if we have
  // another page.
  count++;

  if (cachedItems.length >= count) {
    return cachedItems;
  }

  // We don't have enough issues yet, so we need to fetch more pages until we
  // have enough.
  const nextPage = parent.itemsPerPage ?
    Math.floor(cachedItems.length / parent.itemsPerPage) + 1 : 1;

  const nextItems = await fetchFn(parent, nextPage, cachedItems.length, count);
  cachedItems.push(...nextItems);
  return cachedItems;
}

/**
 * @param {String} after Relay cursor
 * @param {Number} first The number of issues to fetch
 * @return {Issue[]}
 */
export function getIssues({ after, first }) {
  return getPaginatedItems(repo, issues, fetchIssues, after, first);
}

/**
 * @param {Issue} issue The issue that owns the comments we want to get
 * @param {String} after Relay cursor
 * @param {Number} first The number of comments to fetch
 */
export async function getComments(issue, { after, first }) {
  if (!issue.comment_objects) {
    issue.comment_objects = [];
  }

  if (!issue.comments) {
    // issue.comments is the count of comments. If there aren't any, no need to
    // fetch.
    return issue.comment_objects;
  }

  return await getPaginatedItems(
    issue, issue.comment_objects, fetchComments, after, first);
}

/**
 * @param {String} idAndNumber encoded ID and number pair (e.g. '123;4567')
 * @return {Issue}
 */
export async function getIssue(idAndNumber) {
  const number = extractNumberFromIdAndNumber(idAndNumber);

  const cachedIssue = issues.find(issue => issue.number === number);

  if (cachedIssue) {
    return cachedIssue;
  }

  // We don't have this data yet, so let's fetch it. Since we don't know where
  // it belongs in the list, we aren't going to store it.
  const issueData = await fetchIssue(number);
  const issue = new Issue(issueData);
  return issue;
}

/**
 * @return {Repo}
 */
export function getRepo() {
  return repo;
}
