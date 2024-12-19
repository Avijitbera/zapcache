#!/usr/bin/env node
import { DatabaseREPL } from "../repl_client";

const repl = new DatabaseREPL();

repl.start().catch(err => {
    console.error('Failed to start REPL', err)
    process.exit(1)
})