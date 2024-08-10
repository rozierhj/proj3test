import { useState } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
} from 'react-bootstrap';
import Auth from '../utils/auth';

import {useMutation, useLazyQuery} from '@apollo/client';
import {GET_ME} from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations';


const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');


  //fetch the logged-in user's data (GET_ME query) when needed.
 const [getMe, {data: meData}] = useLazyQuery(GET_ME);

 //save a book to the user's savedBooks list using the SAVE_BOOK mutation.
  const [saveBook] = useMutation(SAVE_BOOK,{

    //update the Apollo Client cache with the users new saved book
    update(cache, {data: {saveBook}}) {
      try{
          const {me} = cache.readQuery({query: GET_ME});

          cache.writeQuery({
            query:GET_ME,
            data: {me: {...me, savedBooks:[...me.savedBooks, saveBook]}},
          });
      }
      catch(err){
        console.log('error in updating the cache after saving the book', err)
      }
    }
  });

  // search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      //the google book api that is getting value from book search field
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();
    
      //get the data from the books returned in the google book api
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.accessInfo.webReaderLink,
      }));

      //update searchbook state
      setSearchedBooks(bookData);
      //reset searchinput state
      setSearchInput('');

      //get user data who is logged in
      if (Auth.loggedIn()) {
        getMe();
      }

    } catch (err) {
      console.error(err);
    }
  };

  // saving a book to our database
  const handleSaveBook = async (bookId) => {

    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    //if use not authentice then leave
    if (!Auth.loggedIn()) {
      return false;
    }

    //adding the book to the existing database for that user
    try {
      await saveBook({
        variables: { ...bookToSave },
      });

      // Fetch updated user data after saving the book
      getMe();
    } catch (err) {
      console.error('Error saving the book!', err);
    }
  };

  //loop through all saved books and grab bookid or return empty array
  const savedBookIds = meData?.me?.savedBooks?.map(book => book.bookId) || [];

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Card.Link href={book.link} target='_blank' rel='noopener noreferrer' style={{ display: 'block', marginBottom: '10px' }}>Read Book</Card.Link>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
