const IssueByline = require('./IssueByline');
const IssueLabels = require('./IssueLabels');
const PageContainer = require('./PageContainer');

class Issue extends React.Component {
  render() {
    const {
      issue,
    } = this.props;

    return (
      <PageContainer>
        <h1>{issue.title}</h1>

        <div>
          <IssueByline issue={issue} />
        </div>

        <IssueLabels issue={issue} />
      </PageContainer>
    );
  }
}

export default Relay.createContainer(Issue, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        id,
        title,
        ${IssueByline.getFragment('issue')},
        ${IssueLabels.getFragment('issue')},
      }
    `,
  },
});
