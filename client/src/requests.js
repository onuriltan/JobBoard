import { getAccessToken, isLoggedIn } from "./auth";
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'

const endpointURL = 'http://localhost:9000/graphql/';

const client = new ApolloClient({
  // specify how to connect to the client(Http here)
  link: new HttpLink({ uri: endpointURL }),
  // cache requests
  cache: new InMemoryCache()
});

async function graphqlRequest(query, variables) {
  const request = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  };
  if(isLoggedIn()){
    request.headers['authorization'] = `Bearer ${getAccessToken()}`
  }
  const response = await fetch(endpointURL, request);
  const responseBody = await response.json();
  if (responseBody.errors) {
    const message = responseBody.errors.map(error => error.msg).join('\n');
    throw new Error(message)
  }
  return responseBody.data;
}

export async function loadJobs() {
  const query = `{
        jobs {
          id
          title
          company{
            id
            name
          }
        }
      }`;
  const { jobs } = await graphqlRequest(query);
  return jobs
}

export async function loadJob(id) {
  const query = `query JobQuery($id: ID!){
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
  const { job } = await graphqlRequest(query, { id });
  return job
}

export async function loadCompany(id) {
  const query = `query CompanyQuery($id:ID!){
                    company(id: $id){
                      name
                      description
                      jobs {
                        id
                        title
                      }
                    }
                  }`;
  const { company } = await graphqlRequest(query, { id });
  return company
}

export async function createJob(input) {
  const mutation = `mutation CreateJob($input: CreateJobInput){
                  job: createJob(input: $input) {
                    id
                    title
                    company {
                      id
                      name
                    }
                  }
                }`;
  const { job } = await graphqlRequest(mutation, { input });
  return job
}


