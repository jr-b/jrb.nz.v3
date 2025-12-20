---
title: Search
layout: layouts/base.njk
permalink: /search/
---

<h1>Search jrb.nz</h1>

<form id="searchForm" action="https://duckduckgo.com/" method="get" target="_blank">
    <input type="text" id="searchInput" placeholder="Search..." class="search-input">
    <button type="submit" class="search-button">Search</button>
</form>

<script>
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        const query = document.getElementById('searchInput').value;
        if (query) {
            event.preventDefault();
            window.open(`https://duckduckgo.com/?q=site:jrb.nz+${encodeURIComponent(query)}`, '_blank');
        }
    });
</script>

<style>
    form {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .search-input {
        padding: 8px;
        width: 100%;
        max-width: 600px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1.2em;
    }

    .search-button {
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .search-button:hover {
        background-color: #45a049;
    }
</style>
