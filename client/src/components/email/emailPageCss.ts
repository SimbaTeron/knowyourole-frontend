export const EMAIL_PAGE_CSS = `
.kyr-email-panel { background:#fffdf8; border:1px solid rgba(18,38,58,.18); border-radius:4px; padding:28px 24px; box-shadow:8px 8px 0 rgba(18,38,58,.12); color:#12263a; }
.kyr-email-eyebrow { margin:0 0 10px; font:800 11px/1 Manrope,Inter,system-ui,sans-serif; letter-spacing:.16em; text-transform:uppercase; color:#315f74; }
.kyr-email-title { margin:0 0 12px; font-family:Fraunces,Georgia,serif; font-size:clamp(30px,8vw,40px); line-height:1.02; letter-spacing:-.03em; color:#12263a; }
.kyr-email-body { margin:0 0 20px; color:#456174; font-size:15px; line-height:1.55; }
.kyr-email-primary { min-height:48px; width:100%; border:1px solid #9d3e2b; border-radius:4px; padding:12px 18px; background:linear-gradient(135deg,#c95f46,#a84732); color:#fffdf8; font:800 15px/1.2 Manrope,Inter,system-ui,sans-serif; cursor:pointer; box-shadow:4px 4px 0 rgba(18,38,58,.18); }
.kyr-email-primary:disabled { opacity:.7; cursor:wait; }
.kyr-email-primary:focus-visible { outline:3px solid #315f74; outline-offset:3px; }
.kyr-email-error { margin:12px 0 0; padding:10px 12px; border-radius:4px; background:#fdecea; border:1px solid #e9b4a8; color:#8a2f1d; font-size:14px; }
.kyr-email-foot { margin:20px 0 0; font-size:13px; color:#637b8a; } .kyr-email-foot a { color:#315f74; text-decoration:underline; }
@media (min-width:500px) { .kyr-email-primary { width:auto; } }
`;
