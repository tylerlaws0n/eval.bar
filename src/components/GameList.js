import React from "react";
import GameCard from "./GameCard";

export default function GameList(props) {
    let games = [];
    for (let i = 0; i < props.games.length; i++) {
        games.push(<GameCard name={props.games[i].name} date={props.games[i].date} />);
    }
    return (
        <div className="flex flex-1 flex-col gap-2 text-slate-50 overflow-y-scroll">
            {games}
        </div>
    );
}