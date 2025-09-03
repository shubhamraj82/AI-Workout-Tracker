import { matchForEmptyPath } from "expo-router/build/fork/getStateFromPath-forks";

export function formatDuration(seconds: number): string {
    if(seconds< 60){
        return `${seconds}`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSecondsns = seconds % 60;

    if(hours>0){
        if(remainingSecondsns>0){
            return `${hours}h ${minutes}m ${remainingSecondsns}s`;
        }else if(minutes > 0){
            return`${hours}h ${minutes}m`;
        }else{
            return `${hours}h`;
        }
    } else {
        if(remainingSecondsns>0){
            return `${minutes}m ${remainingSecondsns}s`;
    } else {
        return `${minutes}m`
    }
}
}