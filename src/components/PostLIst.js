import React from 'react';
import { useAPI } from '../hooks/useAPI';

export default function PostList() {
    const { content } = useAPI();

    return (
        <div className="post-container">
            {content.length > 0 && content.map(({ name, description, __id }) => (
                <div className="post" key={__id}>
                    <h2>
                        {name}
                    </h2>
                    <p>
                        {description}
                    </p>
                </div>
            ))}
        </div>
    )
}