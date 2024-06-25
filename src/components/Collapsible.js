import React from 'react';

export default function Collapsible(props) {
    // props are label, currDropdown, setCurrDropdown, selected, and innerJSX
    return (
        <div className='flex flex-col'>
            <button onClick={() => {
                if (props.currCollapsible === props.label) {
                    props.setCurrCollapsible('');
                }
                else {
                    props.setCurrCollapsible(props.label);
                }
            }
            } className="flex items-center justify-between px-4 py-1 gap-4 transition duration-100">
                <span className="flex text-slate-300">
                    {props.label}
                </span>
                <span className="flex flex-1 text-slate-50">
                    {props.selected}
                </span>
                <svg className={"fill-slate-500 transition-all duration-200" + (props.currCollapsible === props.label ? " rotate-180" : "")} xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z"/></svg>
            </button>
            <div className={'flex px-2 transition-all duration-300' + (props.currCollapsible === props.label ? ' max-h-96' : ' max-h-0 opacity-0 invisible')}>
                {props.innerJSX}
            </div>
        </div>
    );
}