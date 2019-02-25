import {Component, OnInit} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '../environments/environment'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private socket;
    private events;
    title = 'Sample Web Page';

    constructor() {
    }

    ngOnInit(): void {
        this.events = [];
        this.socket = io();
        this.socket.connect();
        this.socket.on('message', (eventStr) => {
            const evt = JSON.parse(eventStr);
            console.log('Got event from server:');
            console.log(evt);
            this.events.push(evt);
            if (this.events.length > Number(environment.MAX_EVENT_COUNT)) {
                this.events.shift();
            }
        });
        this.socket.on('error', (error) => {
            alert('Got error: ' + error);
        });
    }
}
