#! /usr/bin/env node
import { Application } from '../dist/index.js';

const app = new Application();

app.Main(process.argv);