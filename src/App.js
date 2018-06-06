import React, { Component } from 'react';
import logo from './logo.svg';
import axious from 'axios';
import './App.css';

const DEFAULT_QUERY = 'redux';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';


//concat string in ES6 



class App extends Component {
  // handle request and mounting using this variable.
  // Case study:  user direct to another page while fetching data fromn api
  _isMounted = false;
  // Constructor
  // bind func use to pass this (class App) to sub function and let it recognize other inner func in this class.
  constructor(props){
    super(props);
    this.state = {
      results: null,
      searchKey:'',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories =  this.fetchSearchTopStories.bind(this);
    // this function will check cached data before fetch api
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }
  render() {
    const{
      searchTerm,
      results, 
      searchKey,
      error
    } = this.state;
    // get page if result exist and result[searchKey] exist. If not return 0
    const page = (
      results && 
      results[searchKey] && 
      results[searchKey].page
    ) || 0;
    // get news list if result exist and result[searchKey] exist. If not return 0
    const list = (
      results && 
      results[searchKey] && 
      results[searchKey].hits
    ) || [];
    if(error) {
      return <p>Some thing went wrong when fetching api {console.log(error)}</p>
    }
    if(!results) {
      return null;
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
            <div>
            <h3>More events and form interaction in ReactJS</h3>
            <Search value={this.state.searchTerm} 
            onSubmit={this.onSearchSubmit}  
            onChange={this.onSearchChange} >
              Search
            </Search>
            <h4>Search term: {this.state.searchTerm}</h4>
            <Table list={list} pattern={searchTerm} />
            </div>
            <div className="interactions">
            <Button onClick={()=> this.fetchSearchTopStories(searchKey, page+1)}> More </Button>
            </div>
      </div>
      
    );
  }

  componentDidMount(){
    this._isMounted = true;

    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    //fetch api
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }
  //support functions
  setSearchTopStories(result){
    const {hits, page} = result;
    const {searchKey, results} = this.state;
    const oldHits = results && results[searchKey] 
        ? this.state.results[searchKey].hits 
        : [];
    //meger by copying 2 arr
    const updatedHits = [...oldHits, ...hits];
    this.setState({results: 
      { ...results, 
        [searchKey]: {hits: updatedHits, page}
      }
    });
  }
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event){
    const {searchTerm} = this.state;
    this.setState({searchKey:searchTerm});
    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm);
    }
    // prevent reload page when press submit button
    event.preventDefault();
  }
  fetchSearchTopStories(searchTerm, page=0){
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;
    // This is native fetch but it is not supported for older browser -> change to axios
    //fetch(url)
    //   .then(response => response.json())
    //   .then(result => this.setSearchTopStories(result))
    //   .catch(error => this.setState({error}));
    
    // Axious fetch here. Notice: axious wrap result in result.data as JSON
    // _isMounted using for controlling passing data from api to state when mounting
    axious(url)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({error}));
  }
  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }
}


// functional stateless component
function Search(props) {
  const { value, onChange, onSubmit, children } = props;
  return (
    <form onSubmit={onSubmit}>
     <input type="text" value={value} onChange={onChange} />
      <button type='submit'> {children} </button>
    </form>
  );
}
// functional stateless component
function Table({ list, pattern }) {
  return (
    <div className="table">
      {list.map(item => (
        <div key={item.objectID} className="table-row">
          <span style={{ width: "50%" }}>
            <a href={item.url}>{item.title}</a>
          </span> | 
          <span style={{ width: "30%" }}>{item.author}</span> | 
          <span style={{ width: "10%" }}>{item.num_comments}</span> | 
          <span style={{ width: "10%" }}>{item.points}</span>
        </div>
      ))}
    </div>
  );
}

// functional stateless component
const Button = ({ onClick, className, children }) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

export default App;
