import { useReducer, useEffect } from 'react';
import axios from 'axios';

const contentService = axios.create({
    baseURL: 'http://localhost:3001',
    timeout: 2000,
});

// action types
const SET_CONTENT = 'SET_CONTENT';
const SET_ERROR = 'SET_ERROR';
const TOGGLE_LOADING = 'TOGGLE_LOADING';

// { type: 'SET_DATA', payload: [...] }
function reducer(state, action) {
    switch (action.type) {
        case SET_CONTENT:
            return {
                ...state,
                content: action.payload
            };
        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };
        case TOGGLE_LOADING:
            return {
                ...state,
                loading: !state.loading
            };
        default:
            return state;
    }
}

const initialState = {
    content: [],
    token: null,
    error: null,
    loading: false,
};

export function useAPI() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    useEffect(() => {
        dispatch({ type: TOGGLE_LOADING });
        contentService.get('/posts', {
            cancelToken: source.token,
        })
            .then(({ data }) => {
                dispatch({ type: SET_CONTENT, payload: data });
                dispatch({ type: TOGGLE_LOADING });
            })
            .catch(error => {
                dispatch({ type: SET_ERROR, payload: error });
                dispatch({ type: TOGGLE_LOADING });
            });

        return () => {
            source.cancel('Petición cancelada')
        };
    }, []);

    // { data, error, loading }
    return state;
}