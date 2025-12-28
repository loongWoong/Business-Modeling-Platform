package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.DomainCreateDTO;
import com.jianmo.platform.dto.request.DomainUpdateDTO;
import com.jianmo.platform.dto.response.DomainVO;

import java.util.List;

public interface DomainService {
    List<DomainVO> getAllDomains();
    DomainVO getDomainById(Long id);
    DomainVO createDomain(DomainCreateDTO dto);
    DomainVO updateDomain(Long id, DomainUpdateDTO dto);
    boolean deleteDomain(Long id);
}
