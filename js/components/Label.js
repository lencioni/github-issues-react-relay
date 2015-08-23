class Label extends React.Component {
  render() {
    return (
      <span
        style={{
          backgroundColor: `#${this.props.label.color}`,
          border: '1px solid rgba(0, 0, 0, .06)',
          borderRadius: 2,
          color: '#fff', // TODO use dark color if bg is too light
          fontSize: 12,
          padding: '2px 4px',
          textShadow: '0 0 2px rgba(0, 0, 0, .15)',
        }}
        >
        {this.props.label.name}
      </span>
    );
  }
}

export default Relay.createContainer(Label, {
  fragments: {
    label: () => Relay.QL`
      fragment on Label {
        color,
        name,
      }
    `,
  },
});
