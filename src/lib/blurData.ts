export const heroBlurDataURL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `
    <svg xmlns='http://www.w3.org/2000/svg' width='160' height='48' viewBox='0 0 160 48'>
      <defs>
        <linearGradient id='a' x1='0' x2='1'>
          <stop offset='0%' stop-color='#071124'/>
          <stop offset='100%' stop-color='#0b1220'/>
        </linearGradient>
        <filter id='b' x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur stdDeviation='6' />
        </filter>
      </defs>
      <rect width='160' height='48' fill='url(#a)' filter='url(#b)' rx='6' />
    </svg>
  `
  ).toString("base64");

export default heroBlurDataURL;
