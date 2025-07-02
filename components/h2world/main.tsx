"use client";
//export default main component

import React, { useState, useEffect, useMemo } from "react";

/* steps and iterations
 *
 * 1, get data from server, bookings, events,
 * -- dirive lessons, from bookings. if bookings have no lessons... show. card handles this
 *  -- sort events, by abstract teacher linked list.
 *
 * componbents | filtered by date
 * : whiteboard . get kite events
 * : student col. lesson with no kite events, show students and teacher card
 * : teacher col. kite events that have status-> teacherCOnfirmation.
 *
 */

export default function H2WorldMain() {
    return (
        <div>
            <h1>Welcome to H2World</h1>
            <p>This is the main component of H2World.</p>
        </div>
    );
}
