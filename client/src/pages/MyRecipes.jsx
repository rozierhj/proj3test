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
import { REMOVE_RECIPE } from '../utils/mutations';
import Auth from '../utils/auth';


const SavedRecipes = () => {

  //getting use data query
  const {loading, data } = useQuery(GET_ME);

  //removing user book mutation
  const [removeRecipe] = useMutation(REMOVE_RECIPE, {

    //update appolo clients cache
    update(cache, {data: {removeRecipe}}){
      try{

        //get users data from cache
        const {me} = cache.readQuery({query:GET_ME});
        cache.writeQuery({
          query: GET_ME,
          //filter out the book that was just removed
          data: {me:{...me, savedRecipes: me.savedRecipes.filter(recipe => recipe.recipeId !== removeRecipe.recipeId),
            recipeCount: me.recipeCount - 1,
          }},
        });
      }
      catch(err){
        console.error('bad bad errors',err);
      }
    },
  });

  //deletes the book from the database
  const handleDeleteRecipe = async (recipeId) => {

    //leave if user no authenticated
    if(!Auth.loggedIn()){
      return false;
    }

    try {

      await removeRecipe({
        variables:{recipeId},
      });
    } 
    catch (err) {
      console.error(err);
    }
  };

  //getting users data
  const foodieData = data?.me || {};
  
  // if data isn't here yet, say LOADING will test using email which is expected value
  if (foodieData.email === undefined || foodieData.email === null || foodieData.email ==='') {
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
          {foodieData.recipeCount
            ? `Viewing ${foodieData.recipeCount} saved ${foodieData.recipeCount === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {foodieData.savedRecipes.map((recipe) => {
            return (
              <Col md="4">
                <Card key={recipe.recipeId} border='dark'>
                  {recipe.image ? <Card.Img src={recipe.image} alt={`The cover for ${recipe.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{recipe.title}</Card.Title>
                    <p className='small'>Authors: </p>
                    <Card.Text>description</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteRecipe(recipe.recipeId)}>
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

export default SavedRecipes;
