#!/bin/bash

curl -X POST http://localhost:4000/auth/login -d '{"email": "brian@wvcc.biz", "password": "admin"}' -H "Content-Type: application/json"
