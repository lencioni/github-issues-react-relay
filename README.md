# GitHub issue viewer

This project will allow you to browse through the GitHub issues for the npm/npm
repo. It is built using React, Relay, and GraphQL.

It was a bit awkward putting GraphQL in front of a RESTful API, but I thought it
would be a fun experiment.

## Installation

```
npm install
```

## Running

Start a local server:

```
npm start
```

## Testing strategy

In the interest of time, I decided to not write any tests for this yet. If I
were to keep working on this project, I would likely use the following strategy:

- Unit tests for library functions. This includes the `truncateString()`
  function. I would also likely extract some other functions, such as the
  linkifying of @-mentions from `<Markdown>`, and unit test those. I would
  likely use Karma with Jasmine, Jest, or perhaps Mocha.

- Integration tests for data fetching. Since most of the heavy lifting is done
  by Relay, GraphQL, and the GitHub API, I would just want to have some broad
  smoke tests to make sure that everything was working together correctly. I
  would probably use Capybara and WebDriver.

- Visual regression testing for UI components. There are a few UI components
  here that I would want to use visual regression testing for, and I would
  likely decouple more components into "smart" and "dumb" components to make
  more things easily testable this way. To do this, I would use a project that I
  have been working on called [Likadan](https://github.com/trotzig/likadan),
  allows me to take snapshots of rendered components and compare them with
  previous versions. This uses uses
  [diffux-core](https://github.com/diffux/diffux-core) to do most of the
  important work.

## Next steps

There are plenty of things that could be fleshed out better. For instance, it
would be better if comments displayed more information such as the poster's name
and the time it was posted. I would also like to have better loading states.
Best option would be to show placeholder content while waiting for actual
content to load, but as a first pass we could just add a throbber to the page or
something simple.

I also went pretty light on the styling--there's plenty of opportunity to make
things a little less craigslist chic here.
