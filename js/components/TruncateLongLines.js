export default class TruncateLongLines extends React.Component {
  render() {
    return (
      <div
        style={{
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        >
        {this.props.children}
      </div>
    );
  }
}
