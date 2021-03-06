/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Item = React.createClass({
  render: function() {
    return (
      <div className="item">
        <span className="amount"> {this.props.amount} </span>
        <span className="description"> {this.props.description} </span>
      </div>
    );
  }
});

var ItemBox = React.createClass({
  loadItemsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleItemSubmit: function(item) {
    var items = this.state.data;
    // Optimistically set an id on the new item. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    item.id = Date.now();
    var newItems = items.concat([item]);
    this.setState({data: newItems});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: item,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: items});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadItemsFromServer();
    setInterval(this.loadItemsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="itemBox">
        <h1>Items</h1>
        <ItemList data={this.state.data} />
        <ItemForm onItemSubmit={this.handleItemSubmit} />
      </div>
    );
  }
});

var ItemList = React.createClass({
  render: function() {
    var itemNodes = this.props.data.map(function(item) {
      return (
        <Item
          amount={item.amount}
          description={item.description}
          key={item.id}
        />
      );
    });
    return (
      <div className="itemList">
        {itemNodes}
      </div>
    );
  }
});

var ItemForm = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleAmountChange: function(e) {
    this.setState({amount: e.target.value});
  },
  handleDescriptionChange: function(e) {
    this.setState({description: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var amount = this.state.amount.trim();
    var description = this.state.description.trim();
    if (!description || !amount) {
      return;
    }
    this.props.onItemSubmit({amount: amount, description: description});
    this.setState({amount: 0, description: description});
  },
  render: function() {
    return (
      <form className="itemForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="How much was your item?"
          value={this.state.amount}
          onChange={this.handleAmountChange}
        />
        <input
          type="text"
          placeholder="What was the item?"
          value={this.state.description}
          onChange={this.handleDescriptionChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

ReactDOM.render(
  <ItemBox url="/api/items" pollInterval={2000} />,
  document.getElementById('content')
);
