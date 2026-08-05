type KakaoPostcodeResult = {
  zonecode: string
  address: string
  roadAddress: string
  autoRoadAddress: string
}

type KakaoGeocoderResult = {
  x: string
  y: string
}

// interface Window {
//   kakao?: {
//     Postcode?: new (options: {
//       oncomplete: (data: KakaoPostcodeResult) => void
//       onclose?: () => void
//     }) => { open: () => void }
//     maps?: {
//       load: (callback: () => void) => void
//       LatLng: new (latitude: number, longitude: number) => unknown
//       Map: new (
//         container: HTMLElement,
//         options: { center: unknown; level: number },
//       ) => {
//         relayout: () => void
//         setCenter: (position: unknown) => void
//       }
//       Marker: new (options: { map: unknown; position: unknown }) => unknown
//       services: {
//         Status: { OK: string }
//         Geocoder: new () => {
//           addressSearch: (
//             address: string,
//             callback: (result: KakaoGeocoderResult[], status: string) => void,
//           ) => void
//         }
//       }
//     }
//   }
// }
