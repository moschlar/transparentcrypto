#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''Extract interesting subtree of firefox bookmark export in JSON format

Usage: bookmarks.py bookmarks_input.json bookmarks_output.json foldertitle
'''

import sys
import json


def recursive_search(data, key, attr):
    '''Recursively search data for an element with key == attr'''
    if isinstance(data, list):
        for d in data:
            x = recursive_search(d, key, attr)
            if x:
                return x
    elif isinstance(data, dict):
        if key in data and data[key] == attr:
            return data
        elif 'children' in data and data['children']:
            x = recursive_search(data['children'], key, attr)
            if x:
                return x


if __name__ == '__main__':
    with open(sys.argv[1], 'r') as infile, open(sys.argv[2], 'w') as outfile:
        bookmarks = json.load(infile)
        bookmarks_selection = recursive_search(bookmarks, 'title', sys.argv[3])
        json.dump(bookmarks_selection, outfile, indent=1)
