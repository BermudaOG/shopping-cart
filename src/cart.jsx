import React, { useState, useEffect, useReducer } from 'react';
import { Container, Row, Col, Image, Input, Accordion, Button } from 'react-bootstrap';
import axios from 'axios';
import ReactDOM from 'react-dom';
import './styles.css';

const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);

  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URL");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [url]);

  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = () => {
  const [items, setItems] = useState(products);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('http://localhost:1337/api/products');
  const [outOfStockMessage, setOutOfStockMessage] = useState('');
  const [initialProducts, setInitialProducts] = useState(products);


  const [{ data, isLoading, isError }, doFetch] = useDataApi("http://localhost:1337/api/products", {
    data: [],
  });

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.find((item) => item.name === name);
  
    if (item && item.instock > 0) {
      item.instock -= 1;
      setCart([...cart, item]);
      
      setOutOfStockMessage('');
    } else {
      setOutOfStockMessage(`Product ${name} is out of stock`);
    }
  };  

  const deleteCartItem = (index) => {
    let deletedItem = cart[index];
    deletedItem.instock += 1; 
    let newCart = cart.filter((item, i) => index !== i);
    setCart(newCart);
  };

  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  const list = items.map((item, index) => (
    <li key={index}>
      <Image src={photos[index % 4]} width={70} roundedCircle />
      <span>{item.name}:{item.cost}</span>
      <button className="common-button" name={item.name} onClick={addToCart}>
        Add Item
      </button>
    </li>
  ));  

  const cartList = cart.map((item, index) => (
    <Accordion.Item key={1 + index}>
      <Accordion.Header>{item.name}</Accordion.Header>
      <Accordion.Body onClick={() => deleteCartItem(index)}>
        $ {item.cost} from {item.country}
      </Accordion.Body>
    </Accordion.Item>
  ));  

  const finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => (
      <div key={index} index={index}>
        {item.name}
      </div>
    ));
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  const handleCheckout = () => {
    setCart([]); 
    setOutOfStockMessage(''); 
  };
  
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      return { name, country, cost, instock };
    });
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button className="common-button" onClick={handleCheckout}>
            CheckOut $ {finalList().total}
          </Button>
          <div>{outOfStockMessage && <p>{outOfStockMessage}</p>}</div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="common-button" type="submit">
            ReStock Products
          </button>
        </form>
      </Row>
    </Container>
  );
};

const root = document.getElementById("root");
const rootInstance = ReactDOM.createRoot(root);
rootInstance.render(<Products />);

export default Products;