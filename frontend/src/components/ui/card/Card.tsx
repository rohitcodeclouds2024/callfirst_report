import React, { ReactNode } from "react";

interface CardProps {
    className?: string;
    title?: string;
    titleClass?: string;
    children: ReactNode;
}

const Card: React.FC<CardProps> = ( { className="", title, titleClass="", children }  ) => {
  return(
    <div className={ `p-6 bg-surface rounded-lg shadow ${ className }`.trim() }>
      { title && <h4 className={ `text-lg font-semibold mb-6 ${ titleClass }`.trim() }>{ title }</h4>  }
      { children }
    </div>
  );
}
export default Card;