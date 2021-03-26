const React = require('react');

interface ParamObj {
  [key: string]: unknown;
}

interface PropTypes extends React.HTMLProps<HTMLInputElement> {
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  types?: string[];
  componentRestrictions?: ParamObj;
  bounds?: ParamObj;
  fields?: string[];
  inputAutocompleteValue?: string;
  options?: {
    componentRestrictions?: ParamObj;
    bounds?: ParamObj;
    location?: ParamObj;
    offset?: number;
    origin?: ParamObj;
    radius?: number;
    sessionToken?: ParamObj;
    types?: string[];
  };
  apiKey?: string;
}
const ReactGooglePlacesWidget: React.VFC<PropTypes> = (props) => {
  const inputRef = React.useRef(null);

  const initAutocomplete = ({
    fields,
    options,
  }: {
    fields: any;
    options: any;
  }) => {
    const addressField = inputRef.current;

    if (!addressField) {
      console.error('No address input field');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(
      addressField,
      options
    );

    autocomplete.setFields(fields);

    autocomplete.addListener('place_changed', () =>
      fillInAddress(autocomplete)
    );
  };

  const fillInAddress = (
    autocomplete: google.maps.places.Autocomplete
  ): void => {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();
    if (typeof onPlaceSelected === 'function') {
      onPlaceSelected(place);
    }

    if (inputRef.current) {
      (inputRef.current as any).value = place.formatted_address;
    }
  };

  const handleLoadScript = () => {
    const googleMapsScriptUrl = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=places`;

    // Check if script exists already
    if (
      document.querySelectorAll(`script[src="${googleMapsScriptUrl}"]`).length >
      0
    ) {
      return Promise.resolve();
    }

    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = googleMapsScriptUrl;

    document.body.appendChild(googleMapsScript);

    return new Promise((resolve) => {
      googleMapsScript.addEventListener('load', () => resolve(null));
    });
  };

  React.useEffect(() => {
    const {
      fields = [
        'address_components',
        'geometry.location',
        'place_id',
        'formatted_address',
      ],
      options = {
        componentRestrictions: { country: 'us' },
        types: ['address'],
      },
    } = props;

    if (props.apiKey) {
      handleLoadScript().then(() => initAutocomplete({ fields, options }));
    } else {
      initAutocomplete({ fields, options });
    }
  }, [props]);

  const {
    onPlaceSelected,
    types,
    componentRestrictions,
    bounds,
    options,
    apiKey,
    inputAutocompleteValue,
    ...rest
  } = props;

  return <input ref={inputRef} {...rest} />;
};

export default ReactGooglePlacesWidget;
