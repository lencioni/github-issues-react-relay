class Issue extends React.Component {
  render() {
    return (
      <div>
        {this.props.issue.title}
        (number: {this.props.issue.number})
      </div>
    );
  }
}

export default Relay.createContainer(Issue, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        id,
        number,
        title,
      }
    `,
  },
});
