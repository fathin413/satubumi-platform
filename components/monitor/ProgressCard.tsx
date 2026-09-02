"use client";


interface Props {
  title:string;
  value:string | number;
  description?:string;
}


export default function ProgressCard({
  title,
  value,
  description
}:Props){

return (

<div className="
bg-white
rounded-2xl
p-6
shadow
">

<p className="
text-sm
text-gray-500
">
{title}
</p>


<h2 className="
mt-2
text-3xl
font-bold
text-emerald-950
">
{value}
</h2>


{
description &&
<p className="
mt-2
text-sm
text-gray-500
">
{description}
</p>
}


</div>

)

}