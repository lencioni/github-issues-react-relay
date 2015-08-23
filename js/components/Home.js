const IssueSummary = require('./IssueSummary');
const Waypoint = require('react-waypoint');

const ISSUES_PER_PAGE = 25;

class Home extends React.Component {
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
      <div
        style={{
          margin: '0 auto',
          maxWidth: 700,
          padding: '0 20px',
        }}
        >
        <h1>{this.props.repo.name} Issues</h1>
        {this.props.repo.issues.edges.map(issue =>
          <IssueSummary issue={issue.node} key={issue.node.id} />
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

export default Relay.createContainer(Home, {
  initialVariables: {
    count: ISSUES_PER_PAGE,
  },

  fragments: {
    repo: () => Relay.QL`
      fragment on Repo {
        id,
        name,
        issues(first: $count) {
          edges {
            node {
              ${IssueSummary.getFragment('issue')},
            },
          },
        },
      }
    `,
  },
});
