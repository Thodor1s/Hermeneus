# Architectural Statement

## Scope

Hermeneus is conceived not simply as a model checkpoint, but as an integrated research environment for the study and deployment of a Greek-language large language model. Its architecture therefore combines corpus formation, model training, retrieval infrastructure, and controlled user access.

The system is divided into three principal layers:

1. `hermeneus-prosvasis`, which assembles and governs the corpus;
2. `hermeneus-genesis`, which trains the model and prepares auxiliary retrieval structures;
3. `hermeneus-chrisis`, which mediates authenticated interaction with the model and presents source-aware outputs.

## Corpus Formation

The corpus is intended to cover a broad historical range of Greek, beginning with alphabetic material from the archaic period and extending to the modern language. At the present stage, pre-alphabetic material, including Linear B, falls outside the project scope.

Texts are admitted only if their use is legally permissible and ethically defensible. Each source should be accompanied by sufficient metadata to support later scholarly use, including at minimum its title, historical period, linguistic form, source location, licensing status, and citation details. Greek-to-Greek translations, especially translations from Ancient to Modern Greek, are of particular interest because they support diachronic interpretation and controlled transformation tasks.

Material written primarily in languages other than Greek should not form part of the training corpus, except in narrowly justified cases connected with processing or documentation. The objective is to train the model on Greek textual evidence rather than on external explanatory traditions.

## Training And Citation

Model training is to proceed from scratch on the basis of the assembled Greek corpus, without dependence on pre-existing general-purpose language model weights. The training component should remain compatible with open-source tooling and with execution on local hardware, while also allowing later transfer to rented GPU infrastructure should corpus size or model scale require it.

Particular care must be taken with the question of citation. A model trained on source texts cannot, by virtue of training alone, be expected to identify reliably the precise textual origin of a response. For that reason, source attribution should be grounded in retrieval over an indexed corpus. In practical terms, this means that responses requiring textual reference ought to be produced through a retrieval-augmented process in which relevant passages are first identified and then supplied, together with their metadata, to the generation layer.

This principle is especially important for philological and scholarly questions, where the system is expected not only to answer in Greek, but also to indicate the relevant passage, work, or edition from which the answer is drawn.

## Access And Deployment

The current deployment model separates the public interface from the heavier training and inference workloads. The web application may be hosted statically, while authentication and access control may be delegated to Firebase Authentication and Firestore. Under this arrangement, authenticated users are admitted only if their access record has been explicitly enabled.

This arrangement is suitable for a research setting in which access is limited to a defined group of collaborators. It permits the system to be distributed publicly at the interface level while retaining administrative control over actual use.

## Present Technical Assumptions

The present implementation assumes the following:

- corpus aggregation and curation are performed locally and remain under explicit human supervision;
- initial model training is undertaken on a Windows system equipped with an RTX 4070 Ti SUPER;
- larger-scale experiments may later be transferred to rented compute infrastructure;
- the user-facing application remains distinct from the training environment;
- citation-oriented retrieval is a necessary component of any serious production configuration.

These assumptions may be revised as the project matures, but they define the current architectural baseline.
