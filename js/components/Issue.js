class Issue extends React.Component {
  render() {
    return (
      <div>
        Issue
      </div>
    );
  }
}

export default Relay.createContainer(Issue, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        id,
      }
    `,
  },
});
