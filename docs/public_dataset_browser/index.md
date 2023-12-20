# Public Dataset Browser

The "Public Dataset Browser" is a feature of
[ChRIS_ui](https://github.com/FNNDSC/ChRIS_ui) which uses
[NiiVue](https://github.com/niivue/niivue) to visualize neuroimaging data found in public feeds.

https://app.fetalmri.org/niivue

To add a public dataset, the feed must be public, and the plugin instance's output files must contain a
file named `.is.chris.publicdataset`. The contents of this file can be arbitrary non-empty data.
