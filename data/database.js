var async = require('asyncawait/async');
var await = require('asyncawait/await');
var fetch = require('node-fetch');

// Model types
class Repo extends Object {}
class Issue extends Object {}

const repo = new Repo();
repo.id = 'npm/npm';
repo.issuesPerPage = undefined;
repo.lastPage = undefined;

let issues = [];

function fetchIssue(number) {
  return fetch(`https://api.github.com/repos/npm/npm/issues/${number}`);
}

function fetchIssues(page, issuesCount, first) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.github.com/repos/npm/npm/issues?page=${page}`)
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

        if (page < repo.lastPage && issuesCount + json.length < first) {
          fetchIssues(page + 1, issuesCount + json.length, first)
            .catch(err => reject(err))
            .then(nextPage => json.push(...nextPage))
            .then(() => resolve(json));
        } else {
          resolve(json);
        }
      })
  });
}

export function getIssues(first) {
  return new Promise((resolve, reject) => {
    if (issues.length >= first) {
      resolve(issues.slice(0, first));
    }

    // We don't have enough issues yet, so we need to fetch more pages until we
    // have enough.
    const nextPage = repo.issuesPerPage ?
      Math.floor(issues.length / repo.issuesPerPage) + 1 : 1;
    fetchIssues(nextPage, issues.length, first)
      .catch(err => reject(err))
      .then(nextIssues => issues.push(...nextIssues))
      .then(() => resolve(issues.slice(0, first)));
  });
}

export function getIssue(number) {
  const cachedIssue = issues.find(issue => issue.number === number);

  if (!cachedIssue) {
    return cachedIssue;
  }

  // We don't have this data yet, so let's fetch it. Since we don't know where
  // it belongs in the list, we aren't going to store it.
  return fetchIssue(number);
}

export function getRepo() {
  return repo;
}
