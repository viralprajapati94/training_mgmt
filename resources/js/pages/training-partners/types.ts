export type StateOption = { id: number; state: string };
export type DistrictOption = { id: number; district: string; state_id: number };
export type TalukaOption = { id: number; taluko: string; district_id: number; state_id: number };
export type CityOption = { id: number; city: string; taluka_id: number; district_id: number; state_id: number };
export type SchemeOption = { id: number; name: string };
export type DocumentOption = { id: number; document_name: string };

export type SchemeEntry = {
    state_id: number | null;
    scheme_id: number | null;
    approval_date: string;
    expiry_date: string | null;
};

export type BankDetailData = {
    bank_name: string;
    branch_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    account_type: string;
    gst_number: string;
    pan_number: string;
    tan_number: string;
    cin_number: string;
    msme_number: string;
    udyam_number: string;
    financial_year_1: string;
    financial_turnover_1: string | number | null;
    financial_year_2: string;
    financial_turnover_2: string | number | null;
    financial_year_3: string;
    financial_turnover_3: string | number | null;
};

export type PartnerFormData = {
    tp_id: string;
    sip_id: string;
    tp_name: string;
    address: string;
    state_id: number | '' | null;
    district_id: number | '' | null;
    taluka_id: number | '' | null;
    city_id: number | '' | null;
    pin_code: string;
    email: string;
    mobile: string;
    password: string;
    website: string;
    spoc_name: string;
    spoc_mobile: string;
    authorized_person_name: string;
    authorized_person_mobile: string;
    status: boolean;
    schemes: SchemeEntry[];
    bank_detail: BankDetailData;
    documents: Record<number, File | null | undefined>;
};

export type ExistingDocument = {
    document_master_id: number;
    original_name?: string | null;
    file_path?: string | null;
};
