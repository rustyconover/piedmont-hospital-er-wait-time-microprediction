# Import Hospital ER Wait times to to Microprediction

This module imports the waiting time from various hospital emergency rooms
to Microprediction.org

## Data Source

The data is sourced from:

https://www.piedmont.org/emergency-room-wait-times/emergency-room-wait-times

## Implementation Details

There is a single Lambda function that is run as a scheduled
CloudWatch Event every 15 minutes to pull new data. This function
is created using webpack to amalgamate the various imported modules.

It runs in about 2 seconds or less every minute.

The write keys are not included in this repo.
