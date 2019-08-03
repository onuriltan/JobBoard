import { getAccessToken, isLoggedIn } from "./auth";
import { ApolloClient, HttpLink, ApolloLink, InMemoryCache } from 'apollo-boost'
import gql from 'graphql-tag'

const endpointURL = 'http://localhost:9000/graphql/';

const authLink = new ApolloLink((operation, forward) => {
  // set auth header if is loggedIn
  if(isLoggedIn()){
    operation.setContext({
      headers: {
        'authorization': `Bearer ${getAccessToken()}`
      }
    });
  }
  return forward(operation)
});

const client = new ApolloClient({
  // specify how to connect to the client(Http here)
  link: ApolloLink.from([
    authLink, // before preparing http request look authLink for setting auth header
    new HttpLink({ uri: endpointURL })
    ]),
  // cache requests
  cache: new InMemoryCache()
});

export async function loadJobs() {
  const query = gql `{
        jobs {
          id
          title
          company{
            id
            name
          }
        }
      }`;
  // fetch policy no cache means it will be send to server every time
  // because we need to query each time loadJobs called because a new job could be created by someone else
  const { data: { jobs } } = await client.query( { query, fetchPolicy:'no-cache' });
  return jobs
}

export async function loadJob(id) {
  const query = gql`
      query JobQuery($id: ID!){
        job(id:$id) {
          id
          title
          description
          company {
            id
            name
          }
        }
      }`;
  const { data: { job } } = await client.query( { query, variables: { id } });
  return job
}

export async function loadCompany(id) {
  const query = gql`query CompanyQuery($id:ID!){
                    company(id: $id){
                      name
                      description
                      jobs {
                        id
                        title
                      }
                    }
                  }`;
  const { data: { company } } = await client.query( { query, variables: { id } });
  return company
}

export async function createJob(input) {
  const mutation = gql `mutation CreateJob($input: CreateJobInput){
                  job: createJob(input: $input) {
                    id
                    title
                    company {
                      id
                      name
                    }
                  }
                }`;
  const { data: { job } } = await client.mutate( { mutation, variables: { input } });
  return job
}


