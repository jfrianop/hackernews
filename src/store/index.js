import React, { createContext, useState } from 'react';

export const Context = createContext();

function PaginationProvider({ children }) {
    const [page, setPage] = useState(1);

    function handlePrevPage() {
        return setPage(page - 1);
    }

    function handleNextPage() {
        return setPage(page + 1);
    }

    return (
        <Context.Provider value={{
            page,
            handlePrevPage,
            handleNextPage,
        }}>
            {children}
        </Context.Provider>
    )
}

export { PaginationProvider };