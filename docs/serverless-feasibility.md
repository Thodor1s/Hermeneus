# On Serverless Deployment And Browser Execution

## Question

One of the architectural questions raised by Hermeneus is whether a model of modest scale could, at least in an initial phase, be executed entirely within the browser, thereby reducing or even removing the need for dedicated inference infrastructure.

## Assessment

Such an arrangement is technically possible, but only under restricted conditions. A browser-executed model must be sufficiently small to be transmitted in reasonable time, sufficiently compressed to fit within the memory constraints of the client device, and supported by an execution environment such as WebGPU or an equivalent browser-side runtime. These conditions make browser execution plausible for small and heavily quantised models, but not for the principal research model once it grows beyond a modest scale.

The feasibility of a serverless architecture must therefore be understood in a qualified sense. The interface layer can readily be hosted in a serverless fashion, and a small experimental checkpoint may be loaded in the browser for limited tasks. However, full-scale training remains impossible in that environment, and large-model inference or large retrieval indexes are unlikely to be practical on ordinary client hardware.

## Methodological Consequence

For the purposes of this project, browser execution should be treated as an optional research pathway rather than as a defining architectural commitment. It is suitable for experimentation, demonstration, and possibly constrained translation or question-answering tasks, provided that the model remains small and that retrieval resources are correspondingly compact.

The principal system, by contrast, should continue to assume a separate inference or serving layer once the model and corpus exceed what can reasonably be handled on the client side.

## Conclusion

Hermeneus may be designed in such a way that small-scale browser inference remains possible. Nevertheless, the broader research programme should not be founded on the assumption that the complete system can or should run entirely within the browser.
