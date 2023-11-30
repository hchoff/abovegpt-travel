import {t} from "elysia";

export const LocationResponse = t.Object({
  location: t.String()
})

export const GeocodeRequestParams = t.Object({
  location: t.String()
});

export const GeocodeResponse = t.Object({
  lat: t.Number(),
  lng: t.Number()
})

type GeocodeFeature = {
  geometry: {
    coordinates: number[]
  }
}

export type GeocodeResponse = {
  features: GeocodeFeature[]
}

export const Coordinate = t.Object({
  lat: t.Number(),
  lng: t.Number()
})

export const TravelRequestParams = t.Object({
  //date: t.Date(),
  fromLat: t.String(),
  fromLng: t.String(),
  toLat: t.String(),
  toLng: t.String()
})

export const TravelResponse = t.Object({
  trip: t.Object({
    tripPatterns: t.Array(t.Object({
      expectedStartTime: t.String(),
      expectedEndTime: t.String(),
      waitingTime: t.Number(),
      duration: t.Number(),
      walkDistance: t.Number(),
      legs: t.Array(t.Object({
        mode: t.String(),
        distance: t.Number(),
        expectedStartTime: t.String(),
        expectedEndTime: t.String(),
        fromPlace: t.Object({
          name: t.String()
        }),
        toPlace: t.Object({
          name: t.String()
        }),
        operator: t.Nullable(t.Object({
          name: t.String(),
        })),
      }))
    }))
  })
})