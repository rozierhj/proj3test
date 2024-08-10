//import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';


const SavedBooks = () => {

  //getting use data query
  const {loading, data } = useQuery(GET_ME);

  //removing user book mutation
  const [removeBook] = useMutation(REMOVE_BOOK, {

    //update appolo clients cache
    update(cache, {data: {removeBook}}){
      try{

        //get users data from cache
        const {me} = cache.readQuery({query:GET_ME});
        cache.writeQuery({
          query: GET_ME,
          //filter out the book that was just removed
          data: {me:{...me, savedBooks: me.savedBooks.filter(book => book.bookId !== removeBook.bookId),
            bookCount: me.bookCount - 1,
          }},
        });
      }
      catch(err){
        console.error('bad bad errors',err);
      }
    },
  });

  //deletes the book from the database
  const handleDeleteBook = async (bookId) => {

    //leave if user no authenticated
    if(!Auth.loggedIn()){
      return false;
    }

    try {

      await removeBook({
        variables:{bookId},
      });
    } 
    catch (err) {
      console.error(err);
    }
  };

  //getting users data
  const userData = data?.me || {};
  
  // if data isn't here yet, say LOADING will test using email which is expected value
  if (userData.email === undefined || userData.email === null || userData.email ==='') {
    return <h2>LOADING...</h2>;
  }

  return (
    <div>
    
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.bookCount
            ? `Viewing ${userData.bookCount} saved ${userData.bookCount === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Card.Link href={book.link} target='_blank' rel='noopener noreferrer' style={{ display: 'block', marginBottom: '10px' }}>Read Book</Card.Link>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>

    </div>
  );

};

export default SavedBooks;
