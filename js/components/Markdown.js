const marked = require('marked');

export default class Markdown extends React.Component {
  render() {
    return (
      <span
        className='Markdown'
        dangerouslySetInnerHTML={{ __html: marked(this.props.source) }}
      />
    );
  }
}
