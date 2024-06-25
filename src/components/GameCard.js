import React from "react";

export default function GameCard(props) {
    return (
        <button className="flex justify-between bg-slate-600 hover:bg-slate-500 p-2 rounded">
            {props.name}
            <span className="flex text-slate-400">{props.date}</span>
        </button>
    )
}