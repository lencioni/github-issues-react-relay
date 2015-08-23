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
repo.issuesPerPage = undefined;
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

function fetchIssues(page, issuesCount, count) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.github.com/repos/npm/npm/issues?page=${page}` +
          `&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`)
      .catch(err => reject(err))
      .then(result => {
        if (repo.lastPage === undefined) {
          // Find out what the last page is. GitHub encodes this information
          // into a link header.
          const links = result.headers.get('link').split(',');
          const lastPageLink = links.find(link => link.includes('rel="last"'));
          if (lastPageLink) {
            repo.lastPage = parseInt(lastPageLink.match(/page=(\d+)/)[1], 10);
          }
        }

        // Convert the result into JSON, because that is the only thing we need
        // from here on out.
        return result.json();
      })
      .then(json => {
        if (repo.issuesPerPage === undefined) {
          repo.issuesPerPage = json.length;
        }

        if (page < repo.lastPage && issuesCount + json.length < count) {
          fetchIssues(page + 1, issuesCount + json.length, count)
            .catch(err => reject(err))
            .then(nextPage => json.push(...nextPage))
            .then(() => json.forEach(encodeNumberInId))
            .then(() => resolve(json));
        } else {
          json.forEach(encodeNumberInId);
          resolve(json);
        }
      })
  });
}

export async function getIssues({ after, first }) {
  let count;
  if (!after) {
    count = first;
  } else {
    // Iterate backwards over the items we have looking at their cursors to
    // find what after is pointing to. We are iterating backwards because the
    // cursor is likely to be very close to the end because our issues array
    // contains what we have from GitHub so far.
    for (let i = issues.length - 1; i >= 0; i--) {
      const issue = issues[i];
      const cursor = cursorForObjectInConnection(issues, issue);
      if (cursor === after) {
        count = i + 1 + first;
      }
    }
  }

  // Always fetch at least 1 extra, so that Relay always knows if we have
  // another page.
  count++;

  if (issues.length >= count) {
    return issues;
  }

  // We don't have enough issues yet, so we need to fetch more pages until we
  // have enough.
  const nextPage = repo.issuesPerPage ?
    Math.floor(issues.length / repo.issuesPerPage) + 1 : 1;

  const nextIssues = await fetchIssues(nextPage, issues.length, count);
  issues.push(...nextIssues);
  return issues;
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
