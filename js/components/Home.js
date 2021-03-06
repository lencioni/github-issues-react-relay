const IssueSummary = require('./IssueSummary');
const PageContainer = require('./PageContainer');
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
    const {
      repo,
    } = this.props;

    return (
      <PageContainer>
        <h1>{this.props.repo.name} Issues</h1>
        {this.props.repo.issues.edges.map(issue =>
          <IssueSummary issue={issue.node} key={issue.node.id} />
        )}

        <Waypoint onEnter={() => this.addPage()} threshold={1} />
      </PageContainer>
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
