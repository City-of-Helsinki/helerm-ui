import fetch from 'isomorphic-fetch';
// ------------------------------------
// Constants
// ------------------------------------
export const GET_NAVIGATION_MENU_ITEMS = 'GET_NAVIGATION_MENU_ITEMS';
export const SELECT_TOS = 'SELECT_TOS';
export const REQUEST_TOS = 'REQUEST_TOS'
export const RECEIVE_TOS = 'RECEIVE_TOS'

// ------------------------------------
// Actions
// ------------------------------------
export function getNavigationMenuItems() {
  return {
    type: GET_NAVIGATION_MENU_ITEMS,
    navigationMenuItems: [{
      id: 1,
      number: '01',
      name: '01 Asuminen',
      keyPath: "0",
      isOpen: false,
      children: []
    }, {
      id: 2,
      number: '02',
      name: '02 Rakennettu ympäristö',
      keyPath: "1",
      isOpen: false,
      children: []
    }, {
      id: 3,
      number: '03',
      name: '03 Perheiden palvelut',
      keyPath: "2",
      isOpen: false,
      children: []
    }, {
      id: 4,
      number: '04',
      name: '04 Terveydenhuolto ja sairaanhoito',
      keyPath: "3",
      isOpen: false,
      children: []
    }, {
      id: 5,
      number: '05',
      name: '05 Sosiaalipalvelut',
      keyPath: "4",
      isOpen: true,
      children: [{
        id: 1,
        number: '05 01',
        name: '05 01 Lasten päivähoito',
        isOpen: false,
        children: [{
          id: 1,
          number: '05 01 00',
          name: '05 01 00 Varhaiskasvatuksen suunnittelu, ohjaus ja valvonta'
        }, {
          id: 2,
          number: '05 01 01',
          name: '05 01 01 Varhaiskasvatukseen hakeminen ja ottaminen',
          isOpen: false,
          children: [{
            id: 1,
            number: '05 01 01 00',
            name: '05 01 01 00 Päiväkoti- ja perhepäivähoitoon hakeminen ja ottaminen (ml. kesällä myös kehitysvammaiset ja autistiset koululaiset)'
          }, {
            id: 2,
            number: '05 01 01 01',
            name: '05 01 01 01 Esiopetukseen hakeminen ja ottaminen'
          }]
        }]
      }, {
        id: 2,
        number: '05 02',
        name: '05 02 Testi',
        isOpen: false,
        children: [{
          id: 1,
          number: '05 02 00',
          name: '05 02 00 Testi 2'
        }]
      }]
    }]
  };
}

export function selectTOS(tos) {
  return {
    type: SELECT_TOS,
    tos
  };
}

export function requestTOS(tos) {
  return {
    type: REQUEST_TOS,
    tos
  }
}

export function receiveTOS(tos, json) {
  return {
    type: RECEIVE_TOS,
    tos,
    data: {
        "id": "6bf114abbd5e4f4f9bbc1aa4de749a74",
        "attributes": {
            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
            "SecurityPeriod": "100",
            "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
            "RetentionPeriod": "-1",
            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
            "PublicityClass": "Salassa pidettävä",
            "SecurityReason": "SAsiakasL 14 §"
        },
        "parent": "fdf9230c0de34746bc314e8afd51d790",
        "phases": [
            {
                "id": "bc1e0aa26b554746b4bf8b17f59d6a83",
                "attributes": {
                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                    "RetentionPeriod": "0",
                    "SocialSecurityNumber": "Ei sisällä henkilötunnusta",
                    "PublicityClass": "Julkinen",
                    "PersonalData": "Ei sisällä henkilötietoja"
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "0b1fdc2c406146d68162132e2add02aa",
                        "attributes": {},
                        "phase": "bc1e0aa26b554746b4bf8b17f59d6a83",
                        "records": [
                            {
                                "id": "b8578253bb53459c80ebdad37f1b1788",
                                "attributes": {
                                    "RetentionPeriod": "0",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "InformationSystem": "sähköposti",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "PersonalData": "Sisältää henkilötietoja",
                                    "PublicityClass": "Julkinen",
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti"
                                },
                                "action": "0b1fdc2c406146d68162132e2add02aa",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:42.991216Z",
                                "modified_at": "2016-10-13T13:11:42.991255Z",
                                "index": 0,
                                "name": "neuvontapyyntö",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:42.965225Z",
                        "modified_at": "2016-10-13T13:11:42.965264Z",
                        "index": 0,
                        "name": "Neuvontapyynnön vastaanottaminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "4e94323ed97e44a59380a0cc8362fa0f",
                        "attributes": {},
                        "phase": "bc1e0aa26b554746b4bf8b17f59d6a83",
                        "records": [
                            {
                                "id": "7101d88afeea44df9a35848512fe3349",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "sähköposti",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "PublicityClass": "Julkinen",
                                    "PersonalData": "Sisältää henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "RetentionPeriod": "0",
                                    "AdditionalInformation": "\n",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen"
                                },
                                "action": "4e94323ed97e44a59380a0cc8362fa0f",
                                "type": "d8b63b22fde24042b1b5dda50c521155",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.046171Z",
                                "modified_at": "2016-10-13T13:11:43.046251Z",
                                "index": 0,
                                "name": "vastaus neuvontapyyntöön",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.015918Z",
                        "modified_at": "2016-10-13T13:11:43.015959Z",
                        "index": 1,
                        "name": "Neuvontapyyntöön vastaaminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "e29ebf494203459bb989d7767853772c",
                        "attributes": {},
                        "phase": "bc1e0aa26b554746b4bf8b17f59d6a83",
                        "records": [
                            {
                                "id": "eba966f4ceb640b2a93f8f53bc49c592",
                                "attributes": {
                                    "RetentionPeriod": "0",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "SocialSecurityNumber": "Ei sisällä henkilötunnusta",
                                    "PersonalData": "Sisältää henkilötietoja",
                                    "PublicityClass": "Julkinen",
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti"
                                },
                                "action": "e29ebf494203459bb989d7767853772c",
                                "type": "224aee9bb5444d75ad72bd83e0112dd1",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.099847Z",
                                "modified_at": "2016-10-13T13:11:43.099886Z",
                                "index": 0,
                                "name": "rekisterimerkintä",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.072521Z",
                        "modified_at": "2016-10-13T13:11:43.072561Z",
                        "index": 2,
                        "name": "Menettelyä koskeva neuvonta",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:42.952175Z",
                "modified_at": "2016-10-13T13:11:42.952214Z",
                "index": 0,
                "name": "Neuvonta/Ohjaus",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "e041b533d7a042b1a0b87f0b48115631",
                "attributes": {
                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                    "SecurityPeriod": "100",
                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                    "RetentionPeriod": "-1",
                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                    "PublicityClass": "Salassa pidettävä",
                    "SecurityReason": "SAsiakasL 14 §"
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "756db8e156364e398f6263d51cbb8293",
                        "attributes": {},
                        "phase": "e041b533d7a042b1a0b87f0b48115631",
                        "records": [
                            {
                                "id": "a5e0ba1421cc47acb60f8a5129bd289a",
                                "attributes": {
                                    "RetentionPeriodTotal": "6",
                                    "RetentionPeriodStart": "Hoidon päättyminen",
                                    "StorageLocation": "Päivähoitoyksikön esimiehen huone",
                                    "StorageOrder": "Aakkosjärjestys",
                                    "InformationSystem": "Asiointikansio/ Web-kori/Effica",
                                    "ProtectionClass": "3 muut asiakirjat",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Asian käsittelyn ajan",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "6",
                                    "AdditionalInformation": "Hakemus vastaanotetaan sähköisesti tai peperisena ensisijaisessa hakukohteessa. Sähköisen hakemuksen tiedot siirtyvät automaattisesta ja paperisesta lomakkeesta tiedot tulee siirtää manuaalisesti Efficaan. Hakemus on voimassa vuoden lähetyspäivästä. Hakemusta voi tarvittaessa täydentää tai muuttaa.  Hakemus säilytetään paperilla tai sähköisesti Efficassa. Kehitysvammaisten ja autististen koululaisten kesällä järjestettävä päiväkotihoito järjestetään lautakunnan vahvistamissa toimipaikoissa, toimintaan ei haeta tällä hakemuksella.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "StorageAccountable": "Päivähoitoyksiön esimies",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "756db8e156364e398f6263d51cbb8293",
                                "type": "b44d95d76bb04af0bae63ac719c21fb4",
                                "attachments": [
                                    {
                                        "id": "ee602e0657104fccae2d813c04bb39db",
                                        "attributes": {
                                            "RetentionPeriodTotal": "Ei säilytetä paperisena arkistossa, paperisäilytys työpisteessä",
                                            "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                            "StorageLocation": "Päivähoitoyksikön esimiehen huone",
                                            "StorageOrder": "Aakkosjärjestys",
                                            "ProtectionClass": "3 muut asiakirjat",
                                            "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "RetentionPeriodOffice": "Asian käsittelyn ajan",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "0",
                                            "AdditionalInformation": "Todistus työstä, opiskelusta tai lapsen vammasta. Ympärivuorokautiseen hoitoon haettaessa tulee toimittaa työvuorolistat vuorotyöstä. Ei voi liittää sähköisesti hakemukseen, toimitetaan paperilla toimipisteeseen.",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "StorageAccountable": "Päivähoitoyksiön esimies",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "a5e0ba1421cc47acb60f8a5129bd289a",
                                        "created_at": "2016-10-13T13:11:43.271329Z",
                                        "modified_at": "2016-10-13T13:11:43.271361Z",
                                        "index": 0,
                                        "name": "hakemuksen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:43.200881Z",
                                "modified_at": "2016-10-13T13:11:43.200917Z",
                                "index": 0,
                                "name": "hakemus varhaiskasvatukseen",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.159909Z",
                        "modified_at": "2016-10-13T13:11:43.159949Z",
                        "index": 0,
                        "name": "Hakemuksen vastaanottaminen varhaiskasvatukseen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "6d8f44ccd0424c1e97e4b9fdf93a6114",
                        "attributes": {},
                        "phase": "e041b533d7a042b1a0b87f0b48115631",
                        "records": [
                            {
                                "id": "d8f83290e1b34316afbb72cdf59fd33d",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "6d8f44ccd0424c1e97e4b9fdf93a6114",
                                "type": "65200449fc7e415eb7fd570ff384366a",
                                "attachments": [
                                    {
                                        "id": "5e5bea159b574e7082c9c98c2dae134f",
                                        "attributes": {
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "-1",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "d8f83290e1b34316afbb72cdf59fd33d",
                                        "created_at": "2016-10-13T13:11:43.392679Z",
                                        "modified_at": "2016-10-13T13:11:43.392716Z",
                                        "index": 0,
                                        "name": "kirjeen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:43.336195Z",
                                "modified_at": "2016-10-13T13:11:43.336233Z",
                                "index": 0,
                                "name": "kirje",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.303701Z",
                        "modified_at": "2016-10-13T13:11:43.303741Z",
                        "index": 1,
                        "name": "Kirjeen vastaanottaminen",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:43.142933Z",
                "modified_at": "2016-10-13T13:11:43.142972Z",
                "index": 1,
                "name": "Vireillepano/-tulo ",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "693b48f38bb84a07a5952c72cecad346",
                "attributes": {
                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                    "SecurityPeriod": "100",
                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                    "RetentionPeriod": "-1",
                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                    "PublicityClass": "Salassa pidettävä",
                    "SecurityReason": "SAsiakasL 14 §"
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "a0a9455b1e7940be8f12c8a805f98eb2",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "c2cd9079a8524e7baf909f16c1befa98",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Hoidon päättyminen",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "6",
                                    "AdditionalInformation": "Uusien asiakkaiden palvelusuunnitelma (Palsu) avataan  kahden viikon kuluessa hakemuksen saapumisesta. Vanhojen asiakkaiden tiedot kirjataan aikaisemmin avattuun palvelusuunnitelmaan. Palvelusuunnitelmasta vastaa sen yksikön esimies, johon lasta ensisijaisesti haetaan tai jossa lapsi on hoidossa. Suunnitelmaan merkitään yhteydenpito asiakkaaseen, vanhempien kuuleminen, perheen ilmoitus paikan vastaanottamisesta/käyttämättä jättämisestä, hoitopaikkatoiveen toteutumisen arviointi, palvelutarpeen muutokset, tutustumisjaksosta sopiminen, täydennykset/muutokset hakemukseen sekä hakemuksen peruminen. Palvelusuunnitelma tulostetaan aina pyynnöstä perheelle. Otos: 8., 18. ja 28. päivinä syntyneiden tiedot säilytetään pysyvästi.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "a0a9455b1e7940be8f12c8a805f98eb2",
                                "type": "c7e7fbacb69045f6a1b2305569bc7445",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.492023Z",
                                "modified_at": "2016-10-13T13:11:43.492062Z",
                                "index": 0,
                                "name": "palvelusuunnitelma",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.456893Z",
                        "modified_at": "2016-10-13T13:11:43.456933Z",
                        "index": 0,
                        "name": "Palvelusuunnittelman aloittaminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "d5a26fc69d4b46d6ab2c6f3daba3e427",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "9f103771f08140c7aa64fbefd25a3804",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "verkkolevy",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "2",
                                    "AdditionalInformation": "Sijotuskokous pidetään noin 1,5 kuukautta ennen hoidon tarpeen alkamista. Muistion tiedot viedään lapsikohtaisesti palvelusuunnitelmaan (Palsuun). Muistion säilyttää sijoituskokouksen puheenjohtaja ja se toimitaan päällikölle tiedoksi.",
                                    "SocialSecurityNumber": "Ei sisällä henkilötunnusta",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "d5a26fc69d4b46d6ab2c6f3daba3e427",
                                "type": "84f226ecee0c4ac6b01a578cc81f4f12",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.559144Z",
                                "modified_at": "2016-10-13T13:11:43.559183Z",
                                "index": 0,
                                "name": "sijoituskokouksen muistio",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.522717Z",
                        "modified_at": "2016-10-13T13:11:43.522772Z",
                        "index": 1,
                        "name": "Varhaiskasvatushakemusten käsitteleminen sijoituskokouksessa",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "582c6a7bb3c3487d8e73f33f33769fa9",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "d4a10d9c671c46bfb6f6a42d38eb8dd0",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "582c6a7bb3c3487d8e73f33f33769fa9",
                                "type": "9884a052e0b1469786efc12089ddccfc",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.678239Z",
                                "modified_at": "2016-10-13T13:11:43.678276Z",
                                "index": 1,
                                "name": "täydennysasiakirja",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "34d838b2facb4e949f98e8986fe7a020",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "582c6a7bb3c3487d8e73f33f33769fa9",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.621215Z",
                                "modified_at": "2016-10-13T13:11:43.621253Z",
                                "index": 0,
                                "name": "täydennyspyyntö",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.589850Z",
                        "modified_at": "2016-10-13T13:11:43.589890Z",
                        "index": 2,
                        "name": "Asiakirjan täydentäminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "475916b931ea4582b9a7c34bf514be07",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "cd62347f197f43b4b02463e82402c072",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "475916b931ea4582b9a7c34bf514be07",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.735681Z",
                                "modified_at": "2016-10-13T13:11:43.735719Z",
                                "index": 0,
                                "name": "asiaan liittyvä tietopyyntö",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "f5e3fadb8230477d87957f6334f28cdd",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "475916b931ea4582b9a7c34bf514be07",
                                "type": "224aee9bb5444d75ad72bd83e0112dd1",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.795031Z",
                                "modified_at": "2016-10-13T13:11:43.795069Z",
                                "index": 1,
                                "name": "vastaus tietopyyntöön",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.704492Z",
                        "modified_at": "2016-10-13T13:11:43.704533Z",
                        "index": 3,
                        "name": "Tietopyynnön käsittely",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "33cf5d036f2a4ae6b8a7d253d449e14a",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "bb57d8e71bfc41179d091b899fe8cb8f",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "33cf5d036f2a4ae6b8a7d253d449e14a",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.861580Z",
                                "modified_at": "2016-10-13T13:11:43.861619Z",
                                "index": 0,
                                "name": "lausuntopyyntö",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "fcff7a0bec984921b27c62ba25ba6da1",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "33cf5d036f2a4ae6b8a7d253d449e14a",
                                "type": "3010747619894d489934cf411803f725",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.928268Z",
                                "modified_at": "2016-10-13T13:11:43.928308Z",
                                "index": 1,
                                "name": "lausunto",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "1fb72ec48d3140429b6219879ffb0740",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "33cf5d036f2a4ae6b8a7d253d449e14a",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:43.991271Z",
                                "modified_at": "2016-10-13T13:11:43.991309Z",
                                "index": 2,
                                "name": "selvityspyyntö",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "dd848faf21f44691a8d1538388cba9b2",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "33cf5d036f2a4ae6b8a7d253d449e14a",
                                "type": "f6c0560f66c24c508d50359eb327a9eb",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.054301Z",
                                "modified_at": "2016-10-13T13:11:44.054338Z",
                                "index": 3,
                                "name": "selvitys",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "ec680f6aec3643bc96b391c64732c7f0",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Piilotetaan prosessiin kuulumattomana. Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "33cf5d036f2a4ae6b8a7d253d449e14a",
                                "type": "85906eba8d584208bef238eebd6b0a46",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.117425Z",
                                "modified_at": "2016-10-13T13:11:44.117463Z",
                                "index": 4,
                                "name": "katselmuspöytäkirja",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "033586613b2f4293b04104192fc42599",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "33cf5d036f2a4ae6b8a7d253d449e14a",
                                "type": "fae81050dc024917b2b0b50f7bd0d1cd",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.183403Z",
                                "modified_at": "2016-10-13T13:11:44.183441Z",
                                "index": 5,
                                "name": "tarkastastuskertomus",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:43.823203Z",
                        "modified_at": "2016-10-13T13:11:43.823247Z",
                        "index": 4,
                        "name": "Asian selvittäminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "b8b144b5064e48d2882fbdc072f5431d",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "1fa107cb4e6345289071f02b067a57b7",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Piilotetaan prosessiin kuulumattomana.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "b8b144b5064e48d2882fbdc072f5431d",
                                "type": "825c381efcf940a9b77c381439935e2a",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.322583Z",
                                "modified_at": "2016-10-13T13:11:44.322622Z",
                                "index": 1,
                                "name": "ilmoitus vaikutusmahdollisuuksien varaamisesta",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "d3760648a09647b7bf5de4a67ce23150",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Piilotetaan prosessiin kuulumattomana. Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "b8b144b5064e48d2882fbdc072f5431d",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.256640Z",
                                "modified_at": "2016-10-13T13:11:44.256679Z",
                                "index": 0,
                                "name": "selityspyyntö",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.217996Z",
                        "modified_at": "2016-10-13T13:11:44.218085Z",
                        "index": 5,
                        "name": "Asianosaisen/osallisen kuuleminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "db0ef5b50c1b4cc08a01c23e2c686ccb",
                        "attributes": {},
                        "phase": "693b48f38bb84a07a5952c72cecad346",
                        "records": [
                            {
                                "id": "74a33568406d4d4eb8a95fbc2b9e508b",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "db0ef5b50c1b4cc08a01c23e2c686ccb",
                                "type": "aeddf238dbbf4677888bdd513f16ce48",
                                "attachments": [
                                    {
                                        "id": "2324e0751da0413d96e6e6b2cc64b324",
                                        "attributes": {
                                            "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo-moduuli",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "0",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "74a33568406d4d4eb8a95fbc2b9e508b",
                                        "created_at": "2016-10-13T13:11:44.445401Z",
                                        "modified_at": "2016-10-13T13:11:44.445436Z",
                                        "index": 0,
                                        "name": "esityksen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:44.386415Z",
                                "modified_at": "2016-10-13T13:11:44.386449Z",
                                "index": 0,
                                "name": "esitys toimielimelle",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.353809Z",
                        "modified_at": "2016-10-13T13:11:44.353849Z",
                        "index": 6,
                        "name": "Esityksen laatiminen toimielimelle",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:43.439302Z",
                "modified_at": "2016-10-13T13:11:43.439340Z",
                "index": 2,
                "name": "Valmistelu/Käsittely",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "0b174f2394b04905ae448746d97f866d",
                "attributes": {
                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                    "SecurityPeriod": "100",
                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                    "RetentionPeriod": "-1",
                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                    "PublicityClass": "Salassa pidettävä",
                    "SecurityReason": "JulkL 24.1 § 30 kohta"
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "7e009044b7c3412199f8e8747e927632",
                        "attributes": {},
                        "phase": "0b174f2394b04905ae448746d97f866d",
                        "records": [
                            {
                                "id": "3a06b06500d147df896666ba944f55a2",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Hoidon päättyminen",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica/Asiointikansio",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "6",
                                    "AdditionalInformation": "Päätöksen tekee päivähoitoyksikön esimies. Mikäli asiakas on toimittanut hakemuksen sähköisesti, myös päätös on sähköinen. Mikäli asiakas on toimittanut paperihakemuksen, päätös tulostetaan ja postitetaan asiakkaalle. Päätös voimassa koulun alkamiseen saakka tai siihen saakka kun lapsella on voimassa oleva sijoitus. Päätös sisältää sijoituksen tiedot.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "7e009044b7c3412199f8e8747e927632",
                                "type": "04d7d35e1133485cba1e7d4b125512e5",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.542078Z",
                                "modified_at": "2016-10-13T13:11:44.542113Z",
                                "index": 0,
                                "name": "varhaiskasvatuspäätös",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.507654Z",
                        "modified_at": "2016-10-13T13:11:44.507693Z",
                        "index": 0,
                        "name": "Varhaiskasvatuspäätöksen tekeminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "6efcaf85c3764c29bbe63445074a41f2",
                        "attributes": {},
                        "phase": "0b174f2394b04905ae448746d97f866d",
                        "records": [
                            {
                                "id": "7a4b6965c73049f19e678b02bf102f66",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Hoidon päättyminen",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica/Asiointikansio",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "6",
                                    "AdditionalInformation": "Päätöksen tekee päivähoitoyksikön esimies. Mikäli asiakas on toimittanut hakemuksen sähköisesti, myös päätös on sähköinen. Mikäli asiakas on toimittanut paperihakemuksen, päätös tulostetaan ja postitetaan asiakkaalle. Päätös voimassa koulun alkamiseen saakka. Päätös sisältää sijoituksen tiedot.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "6efcaf85c3764c29bbe63445074a41f2",
                                "type": "04d7d35e1133485cba1e7d4b125512e5",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.607303Z",
                                "modified_at": "2016-10-13T13:11:44.607340Z",
                                "index": 0,
                                "name": "vuorohoitopäätös",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.572831Z",
                        "modified_at": "2016-10-13T13:11:44.572870Z",
                        "index": 1,
                        "name": "Vuorohoitopäätöksen tekeminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "5edeec178b01444f8fec2535f952adfa",
                        "attributes": {},
                        "phase": "0b174f2394b04905ae448746d97f866d",
                        "records": [
                            {
                                "id": "e4b4c9375d4744f29bfbf34f46c29159",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Hoidon päättyminen",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "6",
                                    "AdditionalInformation": "Uusi sijoitus tehdään kaikista palvelun tarpeessa tapahtuvista muutoksista (toimipiste, ryhmä, palvelun tarve). Sijoitusilmoitus toimitetaan perheelle paperisena, mikäli palvelupäätöksen tietoihin tulee muutoksia. Sijoituksen tekijä poistaa joko koko hakemuksen (lapsen sijoittuessa hakutoiveen mukaiseen toimipisteeseen) tai osittain, jos esim. asiakas jää hakemaan siirtoa. Laskutus alkaa päätöksen ja ensimmäisen sijoituksen alkaen päivämäärästä.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "5edeec178b01444f8fec2535f952adfa",
                                "type": "87a1f87da6024609a3f0e8d4e01545fc",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:44.672556Z",
                                "modified_at": "2016-10-13T13:11:44.672593Z",
                                "index": 0,
                                "name": "sijoitus",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.638111Z",
                        "modified_at": "2016-10-13T13:11:44.638150Z",
                        "index": 2,
                        "name": "Sijoituksen tekeminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "62390d3921574f068eec36869f1f6c47",
                        "attributes": {},
                        "phase": "0b174f2394b04905ae448746d97f866d",
                        "records": [
                            {
                                "id": "f67a0ba52e974695aff5f1bbad418cc0",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "62390d3921574f068eec36869f1f6c47",
                                "type": "565e9bc8749d4aeab4dc819b5deada92",
                                "attachments": [
                                    {
                                        "id": "f27e59d614eb4ce1900bc6159d39866f",
                                        "attributes": {
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo-moduuli",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "-1",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "f67a0ba52e974695aff5f1bbad418cc0",
                                        "created_at": "2016-10-13T13:11:44.901235Z",
                                        "modified_at": "2016-10-13T13:11:44.901271Z",
                                        "index": 0,
                                        "name": "päätöksen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:44.844757Z",
                                "modified_at": "2016-10-13T13:11:44.844809Z",
                                "index": 1,
                                "name": "toimielimen pöytäkirjapäätös",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "6d521991d6fc4f02b249fc3c5633de40",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "62390d3921574f068eec36869f1f6c47",
                                "type": "565e9bc8749d4aeab4dc819b5deada92",
                                "attachments": [
                                    {
                                        "id": "b19cc55d4e49458a902a40df6415f49c",
                                        "attributes": {
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo-moduuli",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "-1",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "6d521991d6fc4f02b249fc3c5633de40",
                                        "created_at": "2016-10-13T13:11:44.789193Z",
                                        "modified_at": "2016-10-13T13:11:44.789227Z",
                                        "index": 0,
                                        "name": "päätöksen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:44.733781Z",
                                "modified_at": "2016-10-13T13:11:44.733824Z",
                                "index": 0,
                                "name": "viranhaltijan pöytäkirjapäätös",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.703148Z",
                        "modified_at": "2016-10-13T13:11:44.703186Z",
                        "index": 3,
                        "name": "Pöytäkirjapäätöksen laatiminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "42972a07d2a549a6a68ffb26915cb483",
                        "attributes": {},
                        "phase": "0b174f2394b04905ae448746d97f866d",
                        "records": [
                            {
                                "id": "fcf5f10060e5459c80c549795d76e0e4",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "42972a07d2a549a6a68ffb26915cb483",
                                "type": "3010747619894d489934cf411803f725",
                                "attachments": [
                                    {
                                        "id": "61c28551d705410186a81c76b5a18023",
                                        "attributes": {
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo-moduuli",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "-1",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "fcf5f10060e5459c80c549795d76e0e4",
                                        "created_at": "2016-10-13T13:11:45.012690Z",
                                        "modified_at": "2016-10-13T13:11:45.012723Z",
                                        "index": 0,
                                        "name": "lausunnon liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:44.957410Z",
                                "modified_at": "2016-10-13T13:11:44.957444Z",
                                "index": 0,
                                "name": "lausunto",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:44.927180Z",
                        "modified_at": "2016-10-13T13:11:44.927213Z",
                        "index": 4,
                        "name": "Lausunnon laatiminen",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "75b0b5c2116e4f028330a5163d360cad",
                        "attributes": {},
                        "phase": "0b174f2394b04905ae448746d97f866d",
                        "records": [
                            {
                                "id": "5999c9e0345945008c7d62a3e6312d96",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "-1",
                                    "AdditionalInformation": "Vuosina 2011-2015 laaditut kirjeet säilytetään paperisena, vuodesta 2016 sähköisenä Ahjossa.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "75b0b5c2116e4f028330a5163d360cad",
                                "type": "65200449fc7e415eb7fd570ff384366a",
                                "attachments": [
                                    {
                                        "id": "a4fbd665ad1648e3a1b7577ea4213c5b",
                                        "attributes": {
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo-moduuli",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Sp-asiakirjoille: Pysyvästi säilytettävät kunnalliset tuki- ja ylläpitotehtävien asiakirjat 2001",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "-1",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "5999c9e0345945008c7d62a3e6312d96",
                                        "created_at": "2016-10-13T13:11:45.127881Z",
                                        "modified_at": "2016-10-13T13:11:45.127917Z",
                                        "index": 0,
                                        "name": "kirjeen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:45.070872Z",
                                "modified_at": "2016-10-13T13:11:45.070906Z",
                                "index": 0,
                                "name": "kirje",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.038665Z",
                        "modified_at": "2016-10-13T13:11:45.038698Z",
                        "index": 5,
                        "name": "Kirjeen laatiminen",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:44.491125Z",
                "modified_at": "2016-10-13T13:11:44.491162Z",
                "index": 3,
                "name": "Päätöksenteko",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "5247def0755b4ce3b6120c904a5dbe2c",
                "attributes": {
                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                    "SecurityPeriod": "100",
                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                    "RetentionPeriod": "10",
                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                    "PublicityClass": "Salassa pidettävä",
                    "SecurityReason": "SAsiakasL 14 §"
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "f2d4b2c015704fcea07890445bbee863",
                        "attributes": {},
                        "phase": "5247def0755b4ce3b6120c904a5dbe2c",
                        "records": [
                            {
                                "id": "c05ffc06b52343cfbc6f6a69033a0963",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "0",
                                    "AdditionalInformation": "Voidaan hävittää päätöksen tultua lainvoimaiseksi. Päätös sisältää sijoituksen tiedot. Efficassa tehty palvelupäätös toimitetaan asiakkaalle sähköisesti asiointikansioon tai postitse tai luovuttamalla henkilökohtaisesti. Jos tuloste luovutetaan, vastaanottajalta pyydetään allekirjoitus oikaisuvaatimuslomakkeeseen. Allekirjoitetusta lomakkeesta otetaan kopio ja se arkistoidaan asiakasasiakirjoihin. Päätökseen liitetään oikaisuvaatimusohje. Uusi asiakasperhe tulostaa asiointikansiosta tuloselvityslomakkeen ja halutessaan asiakasmaksutiedotteen, paperiseen varhaiskasvatuspäätökseen liitetään tuloselvityslomake ja asiakasmaksutiedote.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "f2d4b2c015704fcea07890445bbee863",
                                "type": "04d7d35e1133485cba1e7d4b125512e5",
                                "attachments": [
                                    {
                                        "id": "508f9f29b3a64776aca600d9041b1033",
                                        "attributes": {
                                            "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                            "RetentionPeriod": "0",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "SocialSecurityNumber": "Ei sisällä henkilötunnusta",
                                            "PersonalData": "Ei sisällä henkilötietoja",
                                            "PublicityClass": "Julkinen",
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti"
                                        },
                                        "record": "c05ffc06b52343cfbc6f6a69033a0963",
                                        "created_at": "2016-10-13T13:11:45.282847Z",
                                        "modified_at": "2016-10-13T13:11:45.282885Z",
                                        "index": 0,
                                        "name": "oikaisuvaatimusohje",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:45.228137Z",
                                "modified_at": "2016-10-13T13:11:45.228175Z",
                                "index": 0,
                                "name": "varhaiskasvatuspäätös",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.193574Z",
                        "modified_at": "2016-10-13T13:11:45.193610Z",
                        "index": 0,
                        "name": "Varhaiskasvatuspäätöksen tiedoksianto\n",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "7a308dab3ad141ad97201bdf344f8df5",
                        "attributes": {},
                        "phase": "5247def0755b4ce3b6120c904a5dbe2c",
                        "records": [
                            {
                                "id": "bd43d10cbe53458086ae98433c7c5ec2",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "0",
                                    "AdditionalInformation": "Toiste päätöksestä toimitetaan aina asiakkaalle, joko postitse tai luovuttamalla henkilökohtaisesti. Jos tuloste luovutetaan, vastaanottajalta pyydetään allekirjoitus oikaisuvaatimuslomakkeeseen. Allekirjoitetusta lomakkeesta otetaan kopio ja se arkistoidaan asiakasasiakirjoihin. Sähköisen hakemuksen tehnyt saa päätöksen asiointikansioon.  Päätöksen mukana on ohjeet oikaisuvaatimuksen tekemiseksi. Uudelle asiakasperheelle paperiseen päivähoitopäätökseen liitetään tuloselvityslomake ja asiakasmaksutiedote.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "7a308dab3ad141ad97201bdf344f8df5",
                                "type": "04d7d35e1133485cba1e7d4b125512e5",
                                "attachments": [
                                    {
                                        "id": "a6bce6544a7d4eeea4e9243f58f677c7",
                                        "attributes": {
                                            "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                            "RetentionPeriod": "0",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "SocialSecurityNumber": "Ei sisällä henkilötunnusta",
                                            "PersonalData": "Ei sisällä henkilötietoja",
                                            "PublicityClass": "Julkinen",
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti"
                                        },
                                        "record": "bd43d10cbe53458086ae98433c7c5ec2",
                                        "created_at": "2016-10-13T13:11:45.390431Z",
                                        "modified_at": "2016-10-13T13:11:45.390469Z",
                                        "index": 0,
                                        "name": "oikaisuvaatimusohje",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:45.337922Z",
                                "modified_at": "2016-10-13T13:11:45.337959Z",
                                "index": 0,
                                "name": "vuorohoitopäätös",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.303244Z",
                        "modified_at": "2016-10-13T13:11:45.303282Z",
                        "index": 1,
                        "name": "Vuorohoitopäätöksen tiedoksianto",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "4c4a31401ce94c4a84e17322e1052450",
                        "attributes": {},
                        "phase": "5247def0755b4ce3b6120c904a5dbe2c",
                        "records": [
                            {
                                "id": "5199e4b9eeb546d698251e6441ced657",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "PublicityClass": "Julkinen",
                                    "PersonalData": "Sisältää henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Piilotetaan prosessiin kuulumattomana.",
                                    "SocialSecurityNumber": "Ei sisällä henkilötunnusta"
                                },
                                "action": "4c4a31401ce94c4a84e17322e1052450",
                                "type": "81b97f1772194951831fb369c207f9d5",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.439343Z",
                                "modified_at": "2016-10-13T13:11:45.439383Z",
                                "index": 0,
                                "name": "kuulutus",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "73c05520d6394fe2af6f6854e69ee734",
                                "attributes": {
                                    "RetentionPeriod": "10",
                                    "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "SocialSecurityNumber": "Ei sisällä henkilötunnusta",
                                    "PersonalData": "Sisältää henkilötietoja",
                                    "PublicityClass": "Julkinen",
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti"
                                },
                                "action": "4c4a31401ce94c4a84e17322e1052450",
                                "type": "825c381efcf940a9b77c381439935e2a",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.490171Z",
                                "modified_at": "2016-10-13T13:11:45.490209Z",
                                "index": 1,
                                "name": "ilmoitus",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.411223Z",
                        "modified_at": "2016-10-13T13:11:45.411262Z",
                        "index": 2,
                        "name": "Yleinen tiedoksianto",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "f5aa731e476a49de84dcef00cfc16514",
                        "attributes": {},
                        "phase": "5247def0755b4ce3b6120c904a5dbe2c",
                        "records": [
                            {
                                "id": "58f4bfdaf7e44da785bc467b72534013",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "0",
                                    "AdditionalInformation": "Piilotettu prosessiin kuulumattomana. Voidaan hävittää päätöksen tultua lainvoimaiseksi.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "f5aa731e476a49de84dcef00cfc16514",
                                "type": "36ce2923e6454132ace796239087160b",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.613020Z",
                                "modified_at": "2016-10-13T13:11:45.613058Z",
                                "index": 1,
                                "name": "saantitodistus",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "756bbf2bfa274220bd36c1136669a21f",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "0",
                                    "AdditionalInformation": "Voidaan hävittää päätöksen tultua lainvoimaiseksi.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "f5aa731e476a49de84dcef00cfc16514",
                                "type": "224aee9bb5444d75ad72bd83e0112dd1",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.548159Z",
                                "modified_at": "2016-10-13T13:11:45.548197Z",
                                "index": 0,
                                "name": "pöytäkirjanote",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.512961Z",
                        "modified_at": "2016-10-13T13:11:45.513001Z",
                        "index": 3,
                        "name": "Tiedoksianto asianosaiselle",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:45.175278Z",
                "modified_at": "2016-10-13T13:11:45.175316Z",
                "index": 4,
                "name": "Tiedoksianto",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "898a960454094a6d9cf3d27a83290f56",
                "attributes": {
                    "RetentionPeriod": "6",
                    "RetentionPeriodStart": "Hoidon päättyminen",
                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat."
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "072ba6de520b4154b3ab66a1b698b088",
                        "attributes": {},
                        "phase": "898a960454094a6d9cf3d27a83290f56",
                        "records": [
                            {
                                "id": "2d2f32c1b4b2472883548bb4a421e058",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Hoidon päättyminen",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Effica",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Sekä ei-sp että sp-asiakirjoille: Valtionarkiston päätös kunnallisten asiakirjojen hävittämisestä 1989. Osa 5. Sosiaalihuollon ja holhoustoimen asiakirjat.",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "6",
                                    "AdditionalInformation": "Hakemuksen käsittelijä voi poistaa yksittäisen hakutoiveen tai koko hakemuksen. Hakemuksen poistamisesta tehdään merkintä palvelusuunnitelmaan vain jos asiakas peruu hakemuksen.",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "072ba6de520b4154b3ab66a1b698b088",
                                "type": "87a1f87da6024609a3f0e8d4e01545fc",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.691708Z",
                                "modified_at": "2016-10-13T13:11:45.691746Z",
                                "index": 0,
                                "name": "hakemustietojen poisto",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.657182Z",
                        "modified_at": "2016-10-13T13:11:45.657218Z",
                        "index": 0,
                        "name": "Hakemustietojen poistaminen",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:45.650227Z",
                "modified_at": "2016-10-13T13:11:45.650265Z",
                "index": 5,
                "name": "Toimeenpano",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "02eab4e79b4a4d059fb5933f954e7224",
                "attributes": {
                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                    "SecurityPeriod": "100",
                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                    "RetentionPeriod": "10",
                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                    "PublicityClass": "Salassa pidettävä",
                    "SecurityReason": "SAsiakasL 14 §"
                },
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [
                    {
                        "id": "f021af0383a64cd3907b936e8a5b3bde",
                        "attributes": {},
                        "phase": "02eab4e79b4a4d059fb5933f954e7224",
                        "records": [
                            {
                                "id": "36a064b6e4df407bb33c9f55f14b4a36",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "f021af0383a64cd3907b936e8a5b3bde",
                                "type": "b9778118203042a28b223f9d137723aa",
                                "attachments": [
                                    {
                                        "id": "5875beb72a9e4ee78b6db85d71980a91",
                                        "attributes": {
                                            "RetentionPeriodStart": "Asiakirjan päivämäärä",
                                            "StorageOrder": "Säilytetään sähköisesti",
                                            "InformationSystem": "Ahjo-moduuli",
                                            "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                            "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                            "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                            "PublicityClass": "Salassa pidettävä",
                                            "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                            "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                            "SecurityPeriod": "100",
                                            "RetentionPeriod": "0",
                                            "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                            "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                            "SecurityReason": "SAsiakasL 14 §"
                                        },
                                        "record": "36a064b6e4df407bb33c9f55f14b4a36",
                                        "created_at": "2016-10-13T13:11:45.864093Z",
                                        "modified_at": "2016-10-13T13:11:45.864134Z",
                                        "index": 0,
                                        "name": "oikaisuvaatimuksen liite",
                                        "created_by": null,
                                        "modified_by": null
                                    }
                                ],
                                "created_at": "2016-10-13T13:11:45.797634Z",
                                "modified_at": "2016-10-13T13:11:45.797672Z",
                                "index": 0,
                                "name": "oikaisuvaatimus",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.761643Z",
                        "modified_at": "2016-10-13T13:11:45.761683Z",
                        "index": 0,
                        "name": "Oikaisuvaatimusmenettely",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "281426795f3f4476ae06afc46e07953b",
                        "attributes": {},
                        "phase": "02eab4e79b4a4d059fb5933f954e7224",
                        "records": [
                            {
                                "id": "c15429ef1fb44b0fa5d12e42a7a36a39",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "281426795f3f4476ae06afc46e07953b",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.929701Z",
                                "modified_at": "2016-10-13T13:11:45.929769Z",
                                "index": 0,
                                "name": "lausuntopyyntö",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "bf14a72ea76843b3a6e0a6154ed1629b",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "281426795f3f4476ae06afc46e07953b",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:45.997332Z",
                                "modified_at": "2016-10-13T13:11:45.997373Z",
                                "index": 1,
                                "name": "selvityspyyntö",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "23306711c26b442b898cbd22caec689e",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "281426795f3f4476ae06afc46e07953b",
                                "type": "696c57e302f14543ba46a1c6b002e3bf",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:46.064251Z",
                                "modified_at": "2016-10-13T13:11:46.064293Z",
                                "index": 2,
                                "name": "selityspyyntö",
                                "created_by": null,
                                "modified_by": null
                            },
                            {
                                "id": "411b1c63330a4a778361e9909c3d5c17",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "AdditionalInformation": "Säilytys 10 vuotta lopullisen  päätöksen lainvoimaisuudesta",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "281426795f3f4476ae06afc46e07953b",
                                "type": "825c381efcf940a9b77c381439935e2a",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:46.132495Z",
                                "modified_at": "2016-10-13T13:11:46.132533Z",
                                "index": 3,
                                "name": "ilmoitus valituksen vireillepanosta",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:45.894314Z",
                        "modified_at": "2016-10-13T13:11:45.894358Z",
                        "index": 1,
                        "name": "Valitusmenettely",
                        "created_by": null,
                        "modified_by": null
                    },
                    {
                        "id": "d6739481dade4ac186c5979e63c4a18c",
                        "attributes": {},
                        "phase": "02eab4e79b4a4d059fb5933f954e7224",
                        "records": [
                            {
                                "id": "cad67b787724405aa605a5a34ccaf4dc",
                                "attributes": {
                                    "RetentionPeriodTotal": "Säilytetään sähköisesti",
                                    "RetentionPeriodStart": "Asian lopullinen ratkaisu",
                                    "StorageOrder": "Säilytetään sähköisesti",
                                    "InformationSystem": "Ahjo-moduuli",
                                    "ProtectionClass": "Ei suojeluluokkaa, sähköinen asiakirja",
                                    "RetentionReason": "Ei sp: Yleishallinto 1 - kunnallisten asiakirjojen säilytysaikasuositus",
                                    "Restriction.SecurityPeriodStart": "Asiakirjan päivämäärä",
                                    "PublicityClass": "Salassa pidettävä",
                                    "PersonalData": "Sisältää arkaluonteisia henkilötietoja",
                                    "RetentionPeriodOffice": "Säilytetään sähköisesti",
                                    "SecurityPeriod": "100",
                                    "RetentionPeriod": "10",
                                    "SocialSecurityNumber": "Sisältää henkilötunnuksen",
                                    "SecurityReason": "SAsiakasL 14 §"
                                },
                                "action": "d6739481dade4ac186c5979e63c4a18c",
                                "type": "4330614f14f04da698bef436af00b638",
                                "attachments": [],
                                "created_at": "2016-10-13T13:11:46.196220Z",
                                "modified_at": "2016-10-13T13:11:46.196258Z",
                                "index": 0,
                                "name": "muutoksenhakuviranomaisen ratkaisu",
                                "created_by": null,
                                "modified_by": null
                            }
                        ],
                        "created_at": "2016-10-13T13:11:46.163571Z",
                        "modified_at": "2016-10-13T13:11:46.163611Z",
                        "index": 2,
                        "name": "Muutoksenhakuviranomaisen ratkaisun vastaanottaminen",
                        "created_by": null,
                        "modified_by": null
                    }
                ],
                "created_at": "2016-10-13T13:11:45.743116Z",
                "modified_at": "2016-10-13T13:11:45.743155Z",
                "index": 6,
                "name": "Muutoksenhaku",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "4c209850b0b546b3869529d283d5c492",
                "attributes": {},
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [],
                "created_at": "2016-10-13T13:11:46.224769Z",
                "modified_at": "2016-10-13T13:11:46.224825Z",
                "index": 7,
                "name": "Seuranta/Valvonta",
                "created_by": null,
                "modified_by": null
            },
            {
                "id": "96cc5eb06081479f888af7c0191feaba",
                "attributes": {},
                "function": "6bf114abbd5e4f4f9bbc1aa4de749a74",
                "actions": [],
                "created_at": "2016-10-13T13:11:46.225662Z",
                "modified_at": "2016-10-13T13:11:46.225691Z",
                "index": 8,
                "name": "Prosessi päättyy",
                "created_by": null,
                "modified_by": null
            }
        ],
        "created_at": "2016-10-13T13:11:42.791900Z",
        "modified_at": "2016-10-13T13:11:42.791937Z",
        "index": null,
        "function_id": "05 01 01 00",
        "name": "Päiväkoti- ja perhepäivähoitoon hakeminen ja ottaminen (ml. kesällä myös kehitysvammaiset ja autistiset)",
        "error_count": 0,
        "created_by": null,
        "modified_by": null
    },
    receivedAt: Date.now()
  }
}

export function fetchTOS(tos) {
  return function (dispatch) {
    dispatch(requestTOS(tos));
    //placeholder fetch, will be changed
    return fetch('https://www.reddit.com/r/reactjs.json')
      .then(response => response.json())
      .then(json =>
      dispatch(receiveTOS(tos, json))
    );
  }
}

export const actions = {
  getNavigationMenuItems,
  selectTOS,
  requestTOS,
  receiveTOS,
  fetchTOS
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GET_NAVIGATION_MENU_ITEMS] : (state, action) => {
    return ({ ...state, navigationMenuItems: action.navigationMenuItems });
  },
  [SELECT_TOS] : (state, action) => {
    return ({ ...state, selectedTOSId: action.tos});
  },
  [REQUEST_TOS] : (state, action) => {
    return (Object.assign({}, state, {selectedTOSData: {
      isFetching: true,
      data: {},
      lastUpdated: 0
    }}));
  },
  [RECEIVE_TOS]: (state, action) => {
    return (Object.assign({}, state, {selectedTOSData: {
            isFetching: false,
            data: action.data,
            lastUpdated: action.receivedAt
          }}));
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navigationMenuItems: [],
  selectedTOSId: '',
  selectedTOSData: {
    isFetching: false,
    data: {},
    lastUpdated: 0
  }
};

export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
