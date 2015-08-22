class Issue extends React.Component {
  render() {
    return (
      <div>
        <h2>{this.props.issue.title}</h2>
        <p>number: {this.props.issue.number}</p>
        <p>state: {this.props.issue.state}</p>
        <ul>
          {this.props.issue.labels.map(label =>
            <li>{label}</li>
          )}
        </ul>
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
        labels,
        state,
      }
    `,
  },
});
