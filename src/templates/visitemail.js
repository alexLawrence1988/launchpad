module.exports = `
<html>

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
        /* FONTS */
        @media screen {
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
            }
        }

        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }

        /* SHOW/HIDE ELEMENTS */
        .hidden {
            display: none;
        }
    </style>
</head>

<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- LOGO -->
        <tr>
            <td bgcolor="#DFDFDF" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="480">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                            <a href="https://leadforensics.com" target="_blank">
                                <img alt="Logo"
                                    src="https://www.leadforensics.com/wp-content/themes/lead-forensics/images/logo.png"
                                    width="400" height="100"
                                    style="display: block;  font-family: 'Lato', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px;"
                                    border="0">
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- COPY BLOCK -->
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table style="width: 100%;" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <table width="700" cellpadding="4" cellspacing="0" bgcolor="#ffffff"
                                style="border-radius: 4px 4px 0px 0px;">
                                <tr align="center">
                                    <td>
                                        &nbsp;&nbsp;&nbsp;

                                        <img border="0" src="%BUSINESS.LOGO%">
                                    </td>
                                </tr>
                                <tr>
                                    <td height="200" valign="top" align="right">
                                        <table width="97%" border="0" cellpadding="4" cellspacing="0">
                                            <tr>
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr>
                                                <td width="120" align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Date:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">%VISIT.DATE%</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr>
                                                <td width="120" align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Business:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">%BUSINESS.NAME%</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Address:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">%BUSINESS.FULLADDRESS%</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr class="assignments">
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Assignments:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">%VISIT.ASSIGNMENTS%</span>
                                                </td>
                                            </tr>
                                            <tr class="assignments">
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr class="categories">
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Categories:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">%VISIT.CATEGORIES%</span>
                                                </td>
                                            </tr>
                                            <tr class="categories">
                                                <td colspan="2" height="4">
                                            </tr>
                                            <!-- <tr>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Telephone:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">%BUSINESS.TELEPHONE%</span>
                                                </td>
                                            </tr> -->
                                            <tr>
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr class="website">
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Website:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <a href="http://%BUSINESS.WEBSITE%">%BUSINESS.WEBSITE%</a>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr class="website">
                                                <td colspan="2" height="4">
                                            </tr>
                                            <tr>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <strong>Link:</strong>
                                                    </span>
                                                </td>
                                                <td align="left">
                                                    <span
                                                        style="color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-decoration: none">
                                                        <a href="%VISIT.LINK%"> View this visit in the portal</a>
                                                    </span>
                                                </td>
                                            </tr>

                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
</body>

</html>
`