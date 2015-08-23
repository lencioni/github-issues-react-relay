const Issue = require('./Issue');
const Waypoint = require('react-waypoint');

const ISSUES_PER_PAGE = 25;

class App extends React.Component {
  addPage() {
    const newCount = this.props.relay.variables.count + ISSUES_PER_PAGE;
    this.props.relay.setVariables({
      count: newCount,
    });
  }

  render() {
    const repo = this.props.repo;
    const transactions = this.props.relay.getPendingTransactions(repo);
    const transaction = transactions ? transactions[0] : null;

    return (
      <div>
        <h1>Issues</h1>
        {this.props.repo.issues.edges.map(issue =>
          <Issue issue={issue.node} key={issue.node.id} />
        )}
        {!transaction &&
          // We aren't waiting on more issues, so we want to render the waypoint
          // to try to load the next page.
          <Waypoint onEnter={() => this.addPage()} threshold={1} />
        }
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  initialVariables: {
    count: ISSUES_PER_PAGE,
  },

  fragments: {
    repo: () => Relay.QL`
      fragment on Repo {
        id,
        issues(first: $count) {
          edges {
            node {
              ${Issue.getFragment('issue')},
            },
          },
        },
      }
    `,
  },
});
