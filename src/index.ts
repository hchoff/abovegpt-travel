import {Elysia} from "elysia";
import swagger from "@elysiajs/swagger";
import {GeocodeRequestParams, GeocodeResponse, LocationResponse, TravelRequestParams, TravelResponse} from "./types";
import {gql, request} from "graphql-request";

const app = new Elysia()
    .use(swagger())
    .get("/location", () => {
      return {
        location: "Oslo sentralstasjon"
      };
    }, {
      response: LocationResponse,
      detail: {
        description: "Returns the location of the current user in the location parameter",
      }
    })
    .get("/geocode", async ({query}) => {
      const data = await fetch(`https://api.entur.io/geocoder/v1/autocomplete?text=${query.location}&size=20&lang=no`)
      const json = await data.json() as GeocodeResponse;
      const coordinates = json.features[0].geometry.coordinates


      return {
        lat: coordinates[0],
        lng: coordinates[1]
      }
    }, {
      query: GeocodeRequestParams,
      response: GeocodeResponse,
      detail: {
        description: "Takes in the name of a location as the location request parameter and returns the coordinates of the " +
            "given location as the response. The response contains the latitude and longitude of the location as the lat and lng parameters."
      }
    })
    .get("/travel", async ({query}) => {
      const date = new Date();
      const document = gql`
        {
          trip(
            from: {
              coordinates: {
                latitude: ${query.fromLat}
                longitude:${query.fromLng}
              }
            }
            to: {
              coordinates: {
                latitude: ${query.toLat}
                longitude: ${query.toLng}
              }
            }
            dateTime: "${date.toISOString()}"
          )
          {
            fromPlace {
              name
              vertexType
              flexibleArea
            }
            toPlace {
              name
              vertexType
              flexibleArea
            }
            tripPatterns {
              expectedStartTime
              expectedEndTime
              waitingTime
              duration
              walkDistance
              legs {
                mode
                distance
                expectedStartTime
                expectedEndTime
                fromPlace {
                  name
                }
                toPlace {
                  name
                }
                operator {
                  name
                }
              }
            }
          }
        }
      `

      const response = await request('https://api.entur.io/journey-planner/v3/graphql', document, undefined, {
        "Client-Name": "chatgpt-test"
      })
      return response as typeof TravelResponse.static
    }, {
      query: TravelRequestParams,
      response: TravelResponse,
      detail: {
        /*description: "Finds multiple travel options from the location specified in the fromLat and fromLng parameters to " +
            "the location provided by the toLat and toLng parameters. Use the geocode endpoint to find the coordinates of the locations." +
            "The response contains multiple options for travel defined in the tripPatterns array. Each tripPattern contains several legs" +
            "as well as expected start time (expectedStartTime) and expected end time (expectedEndTime). Return the trip with the shortest" +
            "duration. Also respond with how much wait time there is for the suggested travel option. Give an explanation of each of the legs" +
            "in the journey in the response."*/
        description: "Finds multiple travel options from the location in the fromLat and fromLng parameters to the location in the toLat and toLng parameters. " +
            "Each option contains several suggestions provided in the tripPatterns array. Return the journey with the shortest duration defined by the" +
            " expectedStartTime and expectedEndTime. Give a detailed description of the selected journey which includes start and end destination as well as " +
            "a detailed description of each leg along the journey. Each leg in the journey should at least be described with start and end location as well as " +
            "expected start and end time. Also include the mode of transportation for each leg and the name of the operator if applicable. Separate each leg by a newline."
      }
    })
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
