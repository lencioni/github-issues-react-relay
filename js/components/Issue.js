const PageContainer = require('./PageContainer');

class Issue extends React.Component {
  render() {
    return (
      <PageContainer>
        {this.props.issue.title}
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
      }
    `,
  },
});
