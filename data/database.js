var fetch = require('node-fetch');

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
export class Label extends Object {}
export class Repo extends Object {}
export class User extends Object {}

const repo = new Repo();
repo.id = 'npm/npm';
repo.itemsPerPage = undefined;
repo.lastPage = undefined;

let issues = [];

function encodeNumberInId(issue) {
  // We can't query GitHub for individual issues based on ID--we need the
  // number. In order to make this work with Relay, which relies on the object's
  // ID to wire things up, I am encoding the issue number in its ID.
  issue.id = `${issue.id};${issue.number}`;
  return issue;
}

function fetchIssue(number) {
  return fetch(`https://api.github.com/repos/npm/npm/issues/${number}` +
               `&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`)
    .then(result => result.json())
    .then(json => encodeNumberInId(json));
}

function fetchPaginatedItems(url, parent, page, itemsCount, count, processJsonFn) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .catch(err => reject(err))
      .then(result => {
        if (parent.lastPage === undefined) {
          // Find out what the last page is. GitHub encodes this information
          // into a link header.
          const links = result.headers.get('link').split(',');
          const lastPageLink = links.find(link => link.includes('rel="last"'));
          if (lastPageLink) {
            parent.lastPage = parseInt(lastPageLink.match(/page=(\d+)/)[1], 10);
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
            .then(json => {
              if (processJsonFn) {
                processJsonFn(json)
              }
              return json;
            })
            .then(json => resolve(json));
        } else {
          if (processJsonFn) {
            processJsonFn(json)
          }
          resolve(json);
        }
      })
  });
}

function fetchIssues(repo, page, issuesCount, count) {
  const url = `https://api.github.com/repos/npm/npm/issues?page=${page}` +
              `&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  return fetchPaginatedItems(
    url, repo, page, issuesCount, count,
    json => json.forEach(encodeNumberInId)
  );
}

async function getPaginated(parent, cachedItems, fetchFn, after, first) {
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

  const nextItems = await fetchFn(repo, nextPage, cachedItems.length, count);
  cachedItems.push(...nextItems);
  return cachedItems;
}

export async function getIssue(idAndNumber) {
  const number = idAndNumber.match(/;(\d+)$/)[1];

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

export function getRepo() {
  return repo;
}
