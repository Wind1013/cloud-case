import React from "react";

async function Case({ params }: { params: { id: string } }) {
  const { id } = await params;

  return <div>CASE ID: {id}</div>;
}

export default Case;
